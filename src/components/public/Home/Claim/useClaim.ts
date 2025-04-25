import debounce from 'lodash/debounce';
import { useCallback, useContext, useMemo, useState } from 'react';
import { OTCEntityWithMetadata } from '../useHome';
import { BaseSmartDBFrontEndBtnHandlers, hexToStr, LucidToolsFrontEnd, Token_With_Metadata_And_Amount, useTransactions, useWalletStore } from 'smart-db';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { OTCEntity } from '@/lib/SmartDB/Entities';
import { AppStateContext } from '@/contexts/AppState';
import { ClaimOTCTxParams, TxEnums } from '@/utils/constants/on-chain';
import { ModalsEnums } from '@/utils/constants/constants';
import { useModal } from '@/contexts/ModalContext';

interface TokenCardInterface {
    tokens: Token_With_Metadata_And_Amount;
    btnHandler: () => void;
}

export interface UseClaimProps {
    listOfOtcEntityWithTokens: OTCEntityWithMetadata[];
    walletTokens: Token_With_Metadata_And_Amount[] | undefined;
}

export const useClaim = ({ listOfOtcEntityWithTokens, walletTokens }: UseClaimProps) => {
    const walletStore = useWalletStore();
    //----------------------------------------------------------------------------
    const { appState, setAppState } = useContext(AppStateContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [tokenCardInterfaces, setTokenCardInterfaces] = useState<TokenCardInterface[]>([]);

    //-------------------------
    const { openModal } = useModal();
    //-------------------------
    const resetForm = async () => {
        window.location.reload();
    };
    const onTx = async () => {};
    //--------------------------------------
    async function checkIsValidTx() {
        const isValid = true;
        return isValid;
    }
    //--------------------------------------
    const dependenciesValidTx: any[] = [];
    const { appStore, handleBtnDoTransaction_WithErrorControl } = useTransactions({ dependenciesValidTx, checkIsValidTx, onTx, resetForm });

    const debouncedSetSearchTerm = useCallback(
        debounce((value: string) => setSearchTerm(value), 100),
        []
    );

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetSearchTerm(event.target.value);
    };

    const claimBtnHandler = async (id: string) => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------

            const txParams: ClaimOTCTxParams = {
                protocol_id: appState.protocol!._DB_id,
                otcDbId: id,
            };
            return {
                lucid,
                emulatorDB,
                walletTxParams,
                txParams,
            };
        };
        //--------------------------------------
        openModal(ModalsEnums.PROCESSING_TX);
        //--------------------------------------
        const txApiCall = OTCApi.callGenericTxApi.bind(OTCApi);
        const handleBtnTx = BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V2_NoErrorControl.bind(BaseSmartDBFrontEndBtnHandlers);
        //--------------------------------------
        await handleBtnDoTransaction_WithErrorControl(OTCEntity, TxEnums.OTC_CLAIM, 'Claiming OTC ...', 'claim-otc-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
    };

    const mapTokenToInterface = useCallback(
        (token: OTCEntityWithMetadata): TokenCardInterface => ({
            tokens: token.metadata,
            btnHandler: () => claimBtnHandler(token.entity._DB_id),
        }),
        []
    );

    useMemo(() => {
        if (!walletTokens || walletTokens.length === 0) {
            setTokenCardInterfaces([]);
            return;
        }

        const filtered = listOfOtcEntityWithTokens.filter(
            (otcEntity) => walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id) && otcEntity.entity.od_creator !== walletStore.getPkh()
        );

        setTokenCardInterfaces(filtered.map(mapTokenToInterface));
    }, [listOfOtcEntityWithTokens, walletTokens, mapTokenToInterface]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return tokenCardInterfaces;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return tokenCardInterfaces.filter((item) => hexToStr(item.tokens.TN_Hex).toLowerCase().includes(lowerSearchTerm) || item.tokens.CS.toLowerCase().includes(lowerSearchTerm));
    }, [searchTerm, tokenCardInterfaces]);

    return {
        searchTerm,
        handleInputChange,
        filteredItems,
    };
};
