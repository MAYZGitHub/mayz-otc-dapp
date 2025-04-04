// import { BaseSmartDBFrontEndBtnHandlers, formatTokenNameHexToStr, getUrlForImage, hexToStr, strToHex, Token_With_Metadata_And_Amount, TokenMetadataFrontEndApiCalls, TokensWithMetadataAndAmount, useDetails, useWalletStore } from "smart-db";
// import { SettersModalTx } from "../../useHome";
// import { useContext, useState } from "react";
// import { OTCApi } from "@/lib/SmartDB/FrontEnd";
// import { OTCEntity } from "@/lib/SmartDB/Entities";
// import { CreateOTCTxParams } from "@/utils/constants/on-chain";
// import { AppStateContext } from "@/pages/_app";
// import { OTC_NFT_POLICY_PRE_CBORHEX, protocolIdTn } from "@/utils/constants/on-chain";

// export const useYourTokenSeccion = (settersModalTx: SettersModalTx, walletTokens: Token_With_Metadata_And_Amount[]) => {
//    const walletStore = useWalletStore();
//    //----------------------------------------------------------------------------
//    const { appState, setAppState } = useContext(AppStateContext);
//    const { meshWallet, otcAddress: otcSmartContractAddress, otcScript: otcSmartContractScript, otcCS: otcSmartContractCS, protocolCS } = appState;
//    //----------------------------------------------------------------------------
//    // Function to handle the sell transaction for a specific asset
//    const deployBtnHandler = async (amount: number, token: Token_With_Metadata_And_Amount) => {
//       if (walletStore.isConnected !== true) return; // Ensure wallet is connected
//       if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) {
//          return; // Ensure all required values are available before proceeding
//       }

//       const utxos = walletStore.getUTxOsAtWallet(); // Get the wallet's UTxOs
//       const formattedAmount = amount > 1_000_000 ? `${(amount / 1_000_000).toFixed(2)}M` : amount.toString(); // Format the amount
//       const ownerTokenTN = `OTC-${hexToStr(token.TN_Hex)}-${formattedAmount}`; // Create the token name for the owner
//       const { scriptCbor: ownerTokenScriptHash } =
//          getScript(OTC_NFT_POLICY_PRE_CBORHEX, [utxos[0].txHash, otcSmartContractScript, protocolCS, strToHex(protocolIdTn), strToHex(ownerTokenTN)], 'V3');

//       const ownerTokenCs = resolveScriptHash(ownerTokenScriptHash);

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
//          const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransactionV1(
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
//    };


//    function tokenCardInterface() {
//       const tokens = walletTokens?.slice(1)

//       return tokens?.map(token => {
//          return {
//             srcImageToken: getUrlForImage(token.image),
//             photoAlt: formatTokenNameHexToStr(token.TN_Hex),
//             key: token.CS + token.TN_Hex,
//             tokenName: formatTokenNameHexToStr(token.TN_Hex),
//             tokenAmount: token.amount,
//             btnHandler: (amount: number) => deployBtnHandler(amount, token)
//          }
//       })
//    }

//    return {
//       tokenCardInterface
//       //     isWalletConnectorModalOpen,
//       //     setIsWalletConnectorModalOpen,
//    };
// };
