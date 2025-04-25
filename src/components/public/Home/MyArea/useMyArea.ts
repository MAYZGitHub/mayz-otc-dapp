import { AppStateContext } from '@/contexts/AppState';
import { useModal } from '@/contexts/ModalContext';
import { ModalsEnums } from '@/utils/constants/constants';
import { useContext, useEffect, useState } from 'react';
import { BaseSmartDBFrontEndBtnHandlers, LucidToolsFrontEnd, Token_With_Metadata_And_Amount, TokensWithMetadataAndAmount, useTransactions, useWalletStore } from 'smart-db';
import { OTCEntityWithMetadata } from '../useHome';
import { CancelOTCTxParams, ClaimOTCTxParams, CloseOTCTxParams, CreateOTCTxParams, TxEnums } from '@/utils/constants/on-chain';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { OTCEntity } from '@/lib/SmartDB/Entities';

interface TokensInterface {
    token: Token_With_Metadata_And_Amount;
    btnHandler: () => void;
}
export interface MyAreaProps {
    walletTokens: TokensWithMetadataAndAmount | undefined;
    listOfOtcEntityWithTokens: OTCEntityWithMetadata[];
}
export const useMyArea = (props: MyAreaProps) => {
    //----------------------------------------------------------------------------
    const { walletTokens, listOfOtcEntityWithTokens } = props;
    //----------------------------------------------------------------------------
    const walletStore = useWalletStore();
    //----------------------------------------------------------------------------
    const { appState, setAppState } = useContext(AppStateContext);
    //-------------------------
    //-------------------------
    const [tokensOTCsOfUser, setTokensOTCsOfUser] = useState<OTCEntityWithMetadata[]>([]);
    const [tokensOTCToCancelInterface, setTokensOTCsToCancelInterface] = useState<TokensInterface[]>([]);
    const [tokensOTCToCloseInterface, setTokensOTCsToCloseInterface] = useState<TokensInterface[]>([]);
    //-------------------------
    const { openModal } = useModal();
    //-------------------------
    const resetForm = async () => {};
    const onTx = async () => {
        window.location.reload();
    };
    //--------------------------------------
    async function checkIsValidTx() {
        const isValid = true;
        return isValid;
    }
    //--------------------------------------
    const dependenciesValidTx: any[] = [];
    //--------------------------------------
    const { appStore, handleBtnDoTransaction_WithErrorControl } = useTransactions({ dependenciesValidTx, checkIsValidTx, onTx, resetForm });
    //--------------------------------------
    useEffect(() => {
        const tokens = listOfOtcEntityWithTokens.filter((otcEntity) => otcEntity.entity.od_creator === walletStore.info?.pkh);
        setTokensOTCsOfUser(tokens);
        if (!walletTokens) {
            return;
        }
        const otcToCancel = tokens.filter((otcEntity) => walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id));
        const otcToClose = tokens.filter((otcEntity) => !walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id));

        const mapTokenToInterface = (token: OTCEntityWithMetadata, handler: (id: string) => void) => ({
            token: {
                ...token.metadata,
            },
            btnHandler: () => handler(token.entity._DB_id),
        });
        const otcToCancelInterface = otcToCancel.map((token) => mapTokenToInterface(token, cancelBtnHandler));
        const otcToCloseInterface = otcToClose.map((token) => mapTokenToInterface(token, closeBtnHandler));
        setTokensOTCsToCancelInterface(otcToCancelInterface);
        setTokensOTCsToCloseInterface(otcToCloseInterface);
    }, [listOfOtcEntityWithTokens, walletTokens]);
    //--------------------------------------
    async function cancelBtnHandler(id: string) {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------

            const txParams: CancelOTCTxParams = {
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
        await handleBtnDoTransaction_WithErrorControl(OTCEntity, TxEnums.OTC_CANCEL, 'Cancel OTC ...', 'cancel-otc-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
        // await fetchProtocol();
    }
    async function closeBtnHandler(id: string) {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------

            const txParams: CloseOTCTxParams = {
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
        await handleBtnDoTransaction_WithErrorControl(OTCEntity, TxEnums.OTC_CLOSE, 'Close OTC ...', 'close-otc-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
    }
    //-------------------------
    // Function to handle the sell transaction for a specific asset
    const createOTCBtnHandler = async (token: Token_With_Metadata_And_Amount) => {
        if (appStore.isProcessingTx === true) {
            openModal(ModalsEnums.PROCESSING_TX);
            return;
        }
        //--------------------------------------
        const fetchParams = async () => {
            //--------------------------------------
            const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
            //--------------------------------------

            const txParams: CreateOTCTxParams = {
                protocol_id: appState.protocol!._DB_id!,
                od_token_policy_id: token.CS,
                od_token_tn: token.TN_Hex,
                od_token_amount: token.amount,
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
    };

    return {
        tokensOTCsOfUser,
        tokensOTCToCancelInterface,
        tokensOTCToCloseInterface,
        createOTCBtnHandler,
    };
};
