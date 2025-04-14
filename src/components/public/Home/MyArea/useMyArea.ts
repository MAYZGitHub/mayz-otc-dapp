import { AppStateContext } from '@/contexts/AppState';
import { useModal } from '@/contexts/ModalContext';
import { ModalsEnums } from '@/utils/constants/constants';
import { useContext, useEffect, useState } from 'react';
import { BaseSmartDBFrontEndBtnHandlers, LucidToolsFrontEnd, Token_With_Metadata, Token_With_Metadata_And_Amount, TokensWithMetadataAndAmount, useTransactions, useWalletStore } from 'smart-db';
import { OTCEntityWithMetadata } from '../useHome';
import { CreateOTCTxParams } from '@/utils/constants/on-chain';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { OTCEntity } from '@/lib/SmartDB/Entities';

interface TokensInterface {
    token: Token_With_Metadata;
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
    const [error, setError] = useState<string | null>(null);
    //-------------------------
    const [tokensOTCsOfUser, setTokensOTCsOfUser] = useState<OTCEntityWithMetadata[]>([]);
    const [tokensOTCToCancel, setTokensOTCsToCancel] = useState<OTCEntityWithMetadata[]>([]);
    const [tokensOTCToClose, setTokensOTCsToClose] = useState<OTCEntityWithMetadata[]>([]);
    const [tokensOTCToCancelInterface, setTokensOTCsToCancelInterface] = useState<TokensInterface[]>([]);
    const [tokensOTCToCloseInterface, setTokensOTCsToCloseInterface] = useState<TokensInterface[]>([]);
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
    //--------------------------------------
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
    //--------------------------------------
    useEffect(() => {
        const tokens = listOfOtcEntityWithTokens.filter((otcEntity) => otcEntity.entity.od_creator === walletStore.info?.pkh);
        setTokensOTCsOfUser(tokens);
        const otcToCancel = walletTokens !== undefined ? tokens.filter((otcEntity) => walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id)) : [];
        const otcToClose = walletTokens !== undefined ? tokens.filter((otcEntity) => !walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id)) : [];
        setTokensOTCsToCancel(otcToCancel);
        setTokensOTCsToClose(otcToClose);
        const mapTokenToInterface = (token: OTCEntityWithMetadata, handler: (id: string) => void) => ({
            token: {
                ...token.metadata,
            },
            btnHandler: () => handler(token.entity._DB_id),
        });
        const otcToCancelInterface = tokensOTCToCancel.map((token) => mapTokenToInterface(token, cancelBtnHandler));
        const otcToCloseInterface = tokensOTCToClose.map((token) => mapTokenToInterface(token, closeBtnHandler));
        setTokensOTCsToCancelInterface(otcToCancelInterface);
        setTokensOTCsToCloseInterface(otcToCloseInterface);
    }, [listOfOtcEntityWithTokens, walletTokens]);
    //--------------------------------------
    async function cancelBtnHandler(id: string) {
        //   if (walletStore.isConnected !== true) return; // Ensure the wallet is connected
        //   if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) return;
        //   settersModalTx.setIsTxModalOpen(true); // Open transaction modal
        //   settersModalTx.setTxConfirmed(false);
        //   try {
        //      settersModalTx.setTxHash(undefined);
        //      settersModalTx.setIsTxError(false);
        //      settersModalTx.setTxMessage('Creating Transaction...');
        //      const txParams: CancelOTCTxParams = {
        //         otcDbId: id,
        //         otcSmartContractAddress: otcSmartContractAddress,
        //         otcScript: otcSmartContractScript,
        //         mintingOtcNFT: undefined //TODO: Aca hay que ver como guardamos el script para hacer el burn.
        //      };
        //      const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransactionV1(
        //         OTCEntity,
        //         'Cancel OTC...',
        //         'Cancel Tx',
        //         settersModalTx.setTxMessage,
        //         settersModalTx.setTxHash,
        //         walletStore,
        //         txParams,
        //         OTCApi.callGenericTxApi_.bind(OTCApi, 'cancel-tx')
        //      );
        //      if (result === false) {
        //         throw 'There was an error in the transaction';
        //      }
        //      settersModalTx.setTxConfirmed(result);
        //   } catch (e) {
        //      console.error(e);
        //      settersModalTx.setTxHash(undefined);
        //      settersModalTx.setIsTxError(true);
        //   }
    }
    async function closeBtnHandler(id: string) {
        //   if (walletStore.isConnected !== true) return; // Ensure the wallet is connected
        //   if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) return;
        //   settersModalTx.setIsTxModalOpen(true); // Open transaction modal
        //   settersModalTx.setTxConfirmed(false);
        //   try {
        //      settersModalTx.setTxHash(undefined);
        //      settersModalTx.setIsTxError(false);
        //      settersModalTx.setTxMessage('Creating Transaction...');
        //      const txParams: CloseOTCTxParams = {
        //         otcDbId: id,
        //         otcSmartContractAddress: otcSmartContractAddress,
        //         otcScript: otcSmartContractScript,
        //         mintingOtcNFT: undefined //TODO: Aca hay que ver como guardamos el script para hacer el burn.
        //      };
        //      const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransactionV1(
        //         OTCEntity,
        //         'Cancel OTC...',
        //         'Cancel Tx',
        //         settersModalTx.setTxMessage,
        //         settersModalTx.setTxHash,
        //         walletStore,
        //         txParams,
        //         OTCApi.callGenericTxApi_.bind(OTCApi, 'close-tx')
        //      );
        //      if (result === false) {
        //         throw 'There was an error in the transaction';
        //      }
        //      settersModalTx.setTxConfirmed(result);
        //   } catch (e) {
        //      console.error(e);
        //      settersModalTx.setTxHash(undefined);
        //      settersModalTx.setIsTxError(true);
        //   }
    }
    //-------------------------
    // Function to handle the sell transaction for a specific asset
    const createOTCBtnHandler = async (token: Token_With_Metadata_And_Amount) => {
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
        await handleBtnDoTransaction_WithErrorControl(OTCEntity, `Create OTC Tx`, 'Creating OTC FT...', 'create-otc-tx', fetchParams, txApiCall, handleBtnTx);
        //--------------------------------------
        // await fetchProtocol();
    };

    return {
        tokensOTCsOfUser,
        tokensOTCToCancelInterface,
        tokensOTCToCloseInterface,
        createOTCBtnHandler,
    };
};
