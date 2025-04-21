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
    const [otc_script, set_pd_mayz_deposit_requirement] = useState(appState.protocol?.fOTCScript ?? undefined);
    const [otcSmartContractAddress, setotcSmartContractAddress] = useState(appState.protocol?.fOTCValidator_AddressTestnet ?? undefined);

    //-------------------------
    const { openModal } = useModal();
    //-------------------------
    const resetForm = async () => {};
    const onTx = async () => {};
    //--------------------------------------
    async function checkIsValidTx() {
        const isValid = true;
        return isValid;
    }
    //--------------------------------------
    const dependenciesValidTx: any[] = [];
    const {
        appStore,
        tokensStore,
        session,
        status,
        showUserConfirmation,
        setShowUserConfirmation,
        showProcessingTx,
        setShowProcessingTx,
        isProcessingTx,
        setIsProcessingTx,
        isFaildedTx,
        setIsFaildedTx,
        isConfirmedTx,
        setIsConfirmedTx,
        processingTxMessage,
        setProcessingTxMessage,
        processingTxHash,
        setProcessingTxHash,
        isValidTx,
        setIsValidTx,
        tokensGiveWithMetadata,
        setTokensGiveWithMetadata,
        tokensGetWithMetadata,
        setTokensGetWithMetadata,
        available_ADA_in_Wallet,
        available_forSpend_ADA_in_Wallet,
        isMaxAmountLoaded: isMaxAmountLoadedFromTxHook,
        handleBtnShowUserConfirmation,
        handleBtnDoTransaction_WithErrorControl,
    } = useTransactions({ dependenciesValidTx, checkIsValidTx, onTx, resetForm });

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
        //   if (pdAdmins.length === 0) {
        //       setError('Please enter a valid Admin Payment Key Hashes.');
        //       return;
        //   }
        //   if (isNullOrBlank(pdTokenAdminPolicy_CS)) {
        //       setError('Please enter a valid Admin Token Currency Symbol.');
        //   }
        //   if (!pd_mayz_deposit_requirement) {
        //       setError('Please enter a value.');
        //       return;
        //   }
        //   const pd_mayz_deposit_requirementNumber = Number(pd_mayz_deposit_requirement);
        //   if (isNaN(pd_mayz_deposit_requirementNumber)) {
        //       setError('Please enter a valid number.');
        //       return;
        //   }
        //   if (pd_mayz_deposit_requirementNumber < 0) {
        //       setError('Please enter a positive number.');
        //       return;
        //   }
        if (!otc_script) {
            setError('OTC Script not defined.');
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------
            const txParams: ClaimOTCTxParams = {
                otcDbId: id,
                otcSmartContractAddress: '',
                otcScript: otc_script,
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
        await handleBtnDoTransaction_WithErrorControl(OTCEntity, TxEnums.OTC_CREATE, 'Creating OTC FT...', 'create-otc-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
        // await fetchProtocol();
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

        const filtered = listOfOtcEntityWithTokens.filter((otcEntity) => walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id));

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
function setError(arg0: string) {
    throw new Error('Function not implemented.');
}
