// import { useContext } from "react";
// import { BaseSmartDBFrontEndBtnHandlers, formatTokenNameHexToStr, getUrlForImage, Token_With_Metadata_And_Amount, useWalletStore } from "smart-db";
// import { OTCEntityWithMetadata, SettersModalTx } from "../useHome";
// import { OTCEntity } from "@/lib/SmartDB/Entities";
// import { CancelOTCTxParams, CloseOTCTxParams } from "@/utils/constants/on-chain";
// import { AppStateContext } from "@/pages/_app";
// import { OTCApi } from "@/lib/SmartDB/FrontEnd";

// export const useMyArea = (listOfOtcEntityWithTokens: OTCEntityWithMetadata[], walletTokens: Token_With_Metadata_And_Amount[], settersModalTx: SettersModalTx) => {
//    const walletStore = useWalletStore();
//    //----------------------------------------------------------------------------
//    //----------------------------------------------------------------------------
//    const { appState, setAppState } = useContext(AppStateContext);
//    const { meshWallet, otcAddress: otcSmartContractAddress, otcScript: otcSmartContractScript, otcCS: otcSmartContractCS, protocolCS } = appState;
//    //----------------------------------------------------------------------------

//    function OTCsOfUser() {
//       return listOfOtcEntityWithTokens.filter((otcEntity) => otcEntity.entity.od_creator === walletStore.info?.address);
//    }

//    function filterOtc() {
//       const otcToCancel = OTCsOfUser().filter((otcEntity) =>
//          walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id)
//       );

//       const otcToClose = OTCsOfUser().filter((otcEntity) =>
//          !walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id)
//       );

//       return {
//          otcToCancel,
//          otcToClose,
//       };
//    }

//    async function cancelBtnHandler(id: string) {
//       if (walletStore.isConnected !== true) return; // Ensure the wallet is connected
//       if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) return;

//       settersModalTx.setIsTxModalOpen(true); // Open transaction modal

//       settersModalTx.setTxConfirmed(false);
//       try {
//          settersModalTx.setTxHash(undefined);
//          settersModalTx.setIsTxError(false);
//          settersModalTx.setTxMessage('Creating Transaction...');

//          const txParams: CancelOTCTxParams = {
//             otcDbId: id,
//             otcSmartContractAddress: otcSmartContractAddress,
//             otcScript: otcSmartContractScript,
//             mintingOtcNFT: undefined //TODO: Aca hay que ver como guardamos el script para hacer el burn.
//          };
//          const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransactionV1(
//             OTCEntity,
//             'Cancel OTC...',
//             'Cancel Tx',
//             settersModalTx.setTxMessage,
//             settersModalTx.setTxHash,
//             walletStore,
//             txParams,
//             OTCApi.callGenericTxApi_.bind(OTCApi, 'cancel-tx')
//          );
//          if (result === false) {
//             throw 'There was an error in the transaction';
//          }
//          settersModalTx.setTxConfirmed(result);
//       } catch (e) {
//          console.error(e);
//          settersModalTx.setTxHash(undefined);
//          settersModalTx.setIsTxError(true);
//       }
//    }

//    async function closeBtnHandler(id: string) {
//       if (walletStore.isConnected !== true) return; // Ensure the wallet is connected
//       if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) return;

//       settersModalTx.setIsTxModalOpen(true); // Open transaction modal

//       settersModalTx.setTxConfirmed(false);
//       try {
//          settersModalTx.setTxHash(undefined);
//          settersModalTx.setIsTxError(false);
//          settersModalTx.setTxMessage('Creating Transaction...');

//          const txParams: CloseOTCTxParams = {
//             otcDbId: id,
//             otcSmartContractAddress: otcSmartContractAddress,
//             otcScript: otcSmartContractScript,
//             mintingOtcNFT: undefined //TODO: Aca hay que ver como guardamos el script para hacer el burn.
//          };
//          const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransactionV1(
//             OTCEntity,
//             'Cancel OTC...',
//             'Cancel Tx',
//             settersModalTx.setTxMessage,
//             settersModalTx.setTxHash,
//             walletStore,
//             txParams,
//             OTCApi.callGenericTxApi_.bind(OTCApi, 'close-tx')
//          );
//          if (result === false) {
//             throw 'There was an error in the transaction';
//          }
//          settersModalTx.setTxConfirmed(result);
//       } catch (e) {
//          console.error(e);
//          settersModalTx.setTxHash(undefined);
//          settersModalTx.setIsTxError(true);
//       }
//    }

//    function tokenCardInterface() {
//       const { otcToCancel, otcToClose } = filterOtc();

//       const mapTokenToInterface = (token: OTCEntityWithMetadata, handler: (id: string) => void) => ({
//          key: token.metadata.CS + token.metadata.TN_Hex,
//          srcImageToken: getUrlForImage(token.metadata.image),
//          photoAlt: formatTokenNameHexToStr(token.metadata.TN_Hex),
//          tokenName: formatTokenNameHexToStr(token.metadata.TN_Hex),
//          tokenAmount: token.entity.od_token_amount,
//          btnHandler: () => handler(token.entity._DB_id),
//       });

//       const otcToCancelInterface = otcToCancel.map((token) => mapTokenToInterface(token, cancelBtnHandler));
//       const otcToCloseInterface = otcToClose.map((token) => mapTokenToInterface(token, closeBtnHandler));

//       return { otcToCancelInterface, otcToCloseInterface };
//    }

//    return {
//       tokenCardInterface,
//    };
// };
