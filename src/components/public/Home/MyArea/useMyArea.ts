// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';
// import { applyParamsToScript, Lucid, MintingPolicy } from 'lucid-cardano';

import { useState } from "react";
import { formatTokenNameHexToStr, getAssetOfUTxOs, getUrlForImage, TokenMetadataFrontEndApiCalls, TokensWithMetadataAndAmount, useDetails, useWalletStore } from "smart-db";

export const useMyArea = () => {
   //   /*
   //     This store comes from the global store provided by SmartDB.
   //     It provides all necessary utilities for managing the connected wallet,
   //     including its state, connection, and interaction with the blockchain.
   //   */
   //   const walletStore = useWalletStore();
   //   //----------------------------------------------------------------------------

   //   /*
   //     Access the global application state and state updater function from the AppStateContext.
   //     These properties allow managing and sharing app-wide states such as `menuClass`, `marketScript`,
   //     `marketAddress`, and the minting policy configurations across components.
   //   */
   //   const { appState, setAppState } = useContext(AppStateContext);
   //   const { validatorScript, validatorAddress, mintingPolicyIDPreScript, mintingPolicyIDScript } = appState;
   //   //----------------------------------------------------------------------------

   //   /*
   //     This state is used to control the visibility of the wallet connector modal.
   //     By managing this at the parent component level, it allows child components
   //     to trigger or access the modal state as needed.
   //   */
   //   const [isWalletConnectorModalOpen, setIsWalletConnectorModalOpen] = useState(false);
   //   //----------------------------------------------------------------------------

   //   /*
   //     Function to generate scripts required for transactions using the Lucid library.
   //   */
   //   async function generateScripts(lucid: Lucid) {
   //     let newAppState = { ...appState };

   //     /*
   //       Example implementation: The minting policy script here is not parametrized.
   //       However, in a real-world scenario, the script could have been exported directly
   //       from the smart contract project with parameters applied, making it ready to use.
   //     */
   //     if (mintingPolicyIDScript === undefined || validatorAddress === undefined) {
   //       /*
   //         Apply parameters to the minting policy script.
   //       */
   //       const mintingPolicyIDScript_: MintingPolicy = {
   //         type: 'PlutusV2',
   //         script: applyParamsToScript(mintingPolicyIDPreScript?.script, [lucid!.utils.validatorToScriptHash(validatorScript)]),
   //       };

   //       /* 
   //         Generate the minting policy ID based on the script.
   //       */
   //       const policyID_CS: CS = lucid.utils.mintingPolicyToId(mintingPolicyIDScript_);

   //       /*
   //         Update the app state with the generated minting policy ID.
   //       */
   //       newAppState = {
   //         mintingPolicyIDScript: mintingPolicyIDScript_,
   //         mintingPolicyID_CS: policyID_CS,
   //         ...newAppState,
   //       };

   //       console.log(`mintingPolicyID_CS: ${policyID_CS}`);

   //       /*
   //         Generate and update the market address from the validator script.
   //       */
   //       const marketAddress_ = lucid.utils.validatorToAddress(validatorScript);
   //       newAppState = { validatorAddress, ...newAppState };

   //       console.log(`marketAddress: ${marketAddress_}`);
   //       /*
   //         Update the global app state with the new configurations.
   //       */

   //       setAppState(newAppState);
   //     }
   //     /*
   //       Set up a synchronization hook for `MarketNFTEntity` with the blockchain,
   //       allowing the app to stay updated with the latest data for this entity.
   //     */
   //     await BaseSmartDBFrontEndApiCalls.createHookApi(xxxEntity, newAppState.validatorAddress!, newAppState.mintingPolicyID_CS!);
   //   }

   //   /*
   //     Effect hook to trigger the script generation when the Lucid instance is available
   //   */
   //   useEffect(() => {
   //     const fetch = async () => {
   //       if (walletStore._lucidForUseAsUtils === undefined) return;
   //       try {
   //         await generateScripts(walletStore._lucidForUseAsUtils);
   //       } catch (e) {
   //         console.error(e);
   //       }
   //     };

   //     fetch();
   //   }, [walletStore._lucidForUseAsUtils]);
   const walletStore = useWalletStore();
   //----------------------------------------------------------------------------
   // State for managing loading and input values for tokens
   const [isLoading, setIsLoading] = useState(false); // Whether the app is loading data
   //----------------------------------------------------------------------------
   const [isLoadingAnyTx, setIsLoadingAnyTx] = useState<string | undefined>(undefined);
   //----------------------------------------------------------------------------

   // Function to load the details of the user's assets
   const loadDetails = async () => {
      if (walletStore.isWalletDataLoaded === true && walletStore.getUTxOsAtWallet().length > 0) {
         const totalAssets = getAssetOfUTxOs(walletStore.getUTxOsAtWallet()); // Fetch wallet's UTxOs
         const assetDetails = await TokenMetadataFrontEndApiCalls.getAssetsWithDetailsApi(totalAssets); // Get metadata details for each asset
         return assetDetails;
      } else {
         return undefined; // Return undefined if wallet data isn't loaded
      }
   };

   // Use the useDetails hook to manage the loading and state of asset details
   const { isLoadingDetails, isLoadedDetails, current } = useDetails<TokensWithMetadataAndAmount>({
      nameDetails: 'Balance',
      loadDetails, // Fetches details using the loadDetails function
      dependencies: [walletStore.isWalletDataLoaded], // Dependency on wallet data being loaded
   });

   function deployBtnHandler() {
      console.log("Deploy me")
   }

   function cancelBtnHandler() {
      console.log("Cancelar OTC")
   }

   function closeBtnHandler() {
      console.log("close OTC")
   }

   function tokenCardInterface() {
      const tokens = current?.slice(1)

      return tokens?.map(token => { 
         return {srcImageToken: getUrlForImage(token.image),
         photoAlt: formatTokenNameHexToStr(token.TN_Hex),
         tokenName: formatTokenNameHexToStr(token.TN_Hex),
         tokenAmount: token.amount,
         btnHandler: deployBtnHandler }
      })

   }


   return {
      closeBtnHandler,
      cancelBtnHandler,
      deployBtnHandler,

      isLoading,
      isLoadingDetails,
      isLoadedDetails,
      current,
      isLoadingAnyTx,
      setIsLoadingAnyTx,
      tokenCardInterface
      //     isWalletConnectorModalOpen,
      //     setIsWalletConnectorModalOpen,
   };
};
