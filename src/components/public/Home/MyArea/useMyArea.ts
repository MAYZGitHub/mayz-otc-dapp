import { AppStateContext } from '@/contexts/AppState';
import { useModal } from '@/contexts/ModalContext';
import { ModalsEnums } from '@/utils/constants/constants';
import { CreateOTCTxParams } from '@/utils/constants/on-chain';
import { useContext, useEffect, useState } from 'react';
import {
    BaseSmartDBFrontEndBtnHandlers,
    getUrlForImage,
    hexToStr,
    LucidToolsFrontEnd,
    Token_With_Metadata,
    Token_With_Metadata_And_Amount,
    useTransactions,
    useWalletStore,
} from 'smart-db';
import { OTCEntityWithMetadata } from '../useHome';

interface TokensInterface {
    token: Token_With_Metadata;
    btnHandler: () => void;
}
export const useMyArea = (listOfOtcEntityWithTokens: OTCEntityWithMetadata[], walletTokens: Token_With_Metadata_And_Amount[]) => {
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
        const otcToCancel = tokens.filter((otcEntity) => walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id));
        const otcToClose = tokens.filter((otcEntity) => !walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id));
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
    }, [listOfOtcEntityWithTokens]);
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

    const handleDeployProtocol = async () => {
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
        // const fetchParams = async () => {
        //     //--------------------------------------
        //     const { lucid, emulatorDB, walletTxParams } = await LucidToolsFrontEnd.prepareLucidFrontEndForTx(walletStore);
        //     //--------------------------------------
        //     const txParams: CreateOTCTxParams = {
        //         protocol_id: appState.protocol!._DB_id!,
        //         pd_admins: pdAdmins !== undefined && pdAdmins !== '' ? pdAdmins.split(',').map((admin) => admin.trim()) : [],
        //         pd_token_admin_policy_id: pdTokenAdminPolicy_CS,
        //         pd_mayz_policy_id: MAYZ_CS,
        //         pd_mayz_tn: strToHex(MAYZ_TN),
        //         pd_mayz_deposit_requirement: BigInt(pd_mayz_deposit_requirement),
        //     };
        //     return {
        //         lucid,
        //         emulatorDB,
        //         walletTxParams,
        //         txParams,
        //     };
        // };
        // //--------------------------------------
        // openModal(ModalsEnums.PROCESSING_TX);
        // //--------------------------------------
        // const txApiCall = ProtocolApi.callGenericTxApi.bind(ProtocolApi);
        // const handleBtnTx = BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V2_NoErrorControl.bind(BaseSmartDBFrontEndBtnHandlers);
        // //--------------------------------------
        // await handleBtnDoTransaction_WithErrorControl(ProtocolEntity, `Deploy Tx`, 'Deploying FT...', 'deploy-tx', fetchParams, txApiCall, handleBtnTx);
        // //--------------------------------------
        // await fetchProtocol();
    };
    //-------------------------
    // Function to handle the sell transaction for a specific asset
    const deployBtnHandler = async ( token: Token_With_Metadata_And_Amount) => {
        //       if (walletStore.isConnected !== true) return; // Ensure wallet is connected
        //       if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) {
        //          return; // Ensure all required values are available before proceeding
        //       }
        //       const utxos = walletStore.getUTxOsAtWallet(); // Get the wallet's UTxOs
        //       const formattedAmount = amount > 1_000_000 ? `${(amount / 1_000_000).toFixed(2)}M` : amount.toString(); // Format the amount
        //       const ownerTokenTN = `OTC-${hexToStr(token.TN_Hex)}-${formattedAmount}`; // Create the token name for the owner
        //     //   const { scriptCbor: ownerTokenScriptHash } =
        //     //      getScript(OTC_NFT_POLICY_PRE_CBORHEX, [utxos[0].txHash, otcSmartContractScript, protocolCS, strToHex(protocolIdTn), strToHex(ownerTokenTN)], 'V3');
        //     //   const ownerTokenCs = resolveScriptHash(ownerTokenScriptHash);
        //       settersModalTx.setIsTxModalOpen(true); // Open transaction modal
        //       settersModalTx.setTxConfirmed(false);
        //       try {
        //          settersModalTx.setTxHash("");
        //          settersModalTx.setIsTxError(false);
        //          settersModalTx.setTxMessage('Creating Transaction...'); // Show loading message
        //          // Set up parameters for the transaction
        //          const txParams: CreateOTCTxParams = {
        //             lockAmount: BigInt(amount), // Lock the amount of the asset
        //             otcSmartContract_CS: otcSmartContractCS,
        //             lockTokenTN: token.TN_Hex,
        //             lockTokenCS: token.CS,
        //             tokenOwnerId: ownerTokenCs,
        //             tokenOwnerTN: ownerTokenTN,
        //             validatorAddress: otcSmartContractAddress,
        //             ownerNFT_Script: ownerTokenScriptHash // TODO: CHECK THIS
        //          };
        //          // Call the transaction handler to process the transaction
        //          const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V1(
        //             OTCEntity,
        //             'Creating OTC...',
        //             'Create Tx',
        //             settersModalTx.setTxMessage,
        //             settersModalTx.setTxHash,
        //             walletStore,
        //             txParams,
        //             OTCApi.callGenericTxApi_.bind(OTCApi, 'create-tx')
        //          );
        //          if (result === false) {
        //             throw 'There was an error in the transaction'; // Handle failure
        //          }
        //          settersModalTx.setTxMessage('Transaction has been confirmed. Refreshing data...');
        //          settersModalTx.setTxConfirmed(result); // Set transaction as confirmed
        //       } catch (e) {
        //          console.error(e);
        //          settersModalTx.setTxHash(undefined);
        //          settersModalTx.setIsTxError(true); // Set error flag if transaction fails
        //       }
    };

    return {
        tokensOTCsOfUser,
        tokensOTCToCancelInterface,
        tokensOTCToCloseInterface,
        deployBtnHandler,
    };
};
