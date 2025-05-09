import { useContext } from 'react';
import { AppStateContext } from '@/contexts/AppState';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { OTCEntity } from '@/lib/SmartDB/Entities';
import { isNullOrBlank } from 'smart-db';

import {
    getAssetOfUTxOs,
    isTokenADA,
    PROYECT_NAME,
    pushSucessNotification,
    pushWarningNotification,
    Token_With_Metadata_And_Amount,
    TokenMetadataFrontEndApiCalls,
    TokensWithMetadataAndAmount,
    useDetails,
    useList,
    useWalletStore,
} from 'smart-db';
import { Assets } from '@lucid-evolution/lucid';

// ----------------------------- Types -----------------------------
export type OTCEntityWithMetadata = {
    entity: OTCEntity;
    metadata: Token_With_Metadata_And_Amount;
};

// ---------------------- Fetch Helpers ----------------------------
const fetchWalletTokenDetails = async (walletStore: ReturnType<typeof useWalletStore>) => {
    if (walletStore.isWalletDataLoaded === false || walletStore.getUTxOsAtWallet().length === 0) return undefined;
    const assets = getAssetOfUTxOs(walletStore.getUTxOsAtWallet());
    const filtered: Assets = Object.fromEntries(
        Object.entries(assets).filter(([unit]) => {
            if (unit.length < 56) return false; // too short to have policy + asset
            const policyId = unit.slice(0, 56);
            const assetName = unit.slice(56);
            return assetName.length > 0;
        })
    );
    const details = await TokenMetadataFrontEndApiCalls.getAssetsWithDetailsApi(filtered);
    return details.filter((item) => !isTokenADA(item.CS, item.TN_Hex));
};

const fetchOtcTokensWithMetadata = async (): Promise<OTCEntityWithMetadata[]> => {
    const entities: OTCEntity[] = await OTCApi.getAllApi_({ fieldsForSelect: {}, loadRelations: { smartUTxO_id: true } });
    if (entities.length === 0) return [];

    const tokens = entities.map(({ od_token_policy_id, od_token_tn }) => ({ CS: od_token_policy_id, TN_Hex: od_token_tn }));
    const metadataList = await TokenMetadataFrontEndApiCalls.get_Tokens_MetadataApi(tokens);

    return entities.reduce<OTCEntityWithMetadata[]>((acc, entity) => {
        const metadata = metadataList.find((m) => m.CS === entity.od_token_policy_id && m.TN_Hex === entity.od_token_tn);
        if (metadata) {
            acc.push({ entity, metadata: { ...metadata, amount: BigInt(entity.od_token_amount) } });
        }
        return acc;
    }, []);
};

// ------------------------- Hook ----------------------------------
export const useHome = () => {
    const walletStore = useWalletStore();
    const { appState, setAppState } = useContext(AppStateContext);

    const {
        isLoadingDetails,
        isLoadedDetails,
        current: walletTokens,
    } = useDetails<TokensWithMetadataAndAmount>({
        nameDetails: 'Balance',
        loadDetails: () => fetchWalletTokenDetails(walletStore),
        dependencies: [walletStore.isWalletDataLoaded],
    });

    const {
        isLoadingList,
        isLoadedList,
        list: listOfOtcEntityWithTokens,
        refreshList,
    } = useList<OTCEntityWithMetadata>({
        nameList: OTCEntity.className(),
        loadList: fetchOtcTokensWithMetadata,
    });

    const handleBtnSync = async () => {
        if (!appState.protocol) return;
        try {
            await OTCApi.syncWithAddressApi(OTCEntity, appState.protocol.getOTC_Net_Address(), appState.protocol.getOTC_NET_id_CS(), true);
            refreshList();
            pushSucessNotification(PROYECT_NAME, 'Synchronization complete!', false);
        } catch (e) {
            console.error(e);
            pushWarningNotification(PROYECT_NAME, 'Synchronization Error: ' + e);
        }
    };

    return {
        appState,
        sidebarState: appState.sidebarState,
        isWalletConnected: walletStore.isConnected,
        walletTokens,
        listOfOtcEntityWithTokens,
    };
};
