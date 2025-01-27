
import { resolveScriptHash } from "@meshsdk/core";
import { otcScriptPreScriptCBORHEX, otcSmartContractPolicyIdTn, protocolIdTn } from "@root/src/lib/Commons/Constants/onchain";
import { getScript } from "@root/src/lib/Commons/meshCommons";
import { OTCEntity } from "@root/src/lib/SmartDB/Entities";
import { OTCApi } from "@root/src/lib/SmartDB/FrontEnd";
import { AppStateContext } from "@root/src/pages/_app";
import { Lucid } from "lucid-cardano";
import { useContext, useEffect, useState } from "react";
import { BaseSmartDBFrontEndApiCalls, getAssetOfUTxOs, pushSucessNotification, pushWarningNotification, strToHex, TokenMetadataEntity, TokenMetadataFrontEndApiCalls, TokensWithMetadataAndAmount, useDetails, useList, useWalletStore } from "smart-db";

export interface SettersModalTx {
   setIsTxModalOpen: (value: boolean) => void;
   setTxHash: (value: string | undefined) => void;
   setIsTxError: (value: boolean) => void;
   setTxMessage: (value: string | undefined) => void;
   setTxConfirmed: (value: boolean) => void;
}

export type OTCEntityWithMetadata = {
   entity: OTCEntity; // The MarketNFT entity itself
   metadata: TokenMetadataEntity; // The metadata for the token associated with the entity
};

export const useHome = () => {
   //   /*
   //     This store comes from the global store provided by SmartDB.
   //     It provides all necessary utilities for managing the connected wallet,
   //     including its state, connection, and interaction with the blockchain.
   //   */
   const walletStore = useWalletStore();
   //   //----------------------------------------------------------------------------

   //   /*
   //     Access the global application state and state updater function from the AppStateContext.
   //     These properties allow managing and sharing app-wide states such as `menuClass`, `otcScript`,
   //     `marketAddress`, and the minting policy configurations across components.
   //   */
   const { appState, setAppState } = useContext(AppStateContext);
   const { sidebarState, protocolCS, protocolScript, otcSmartContractAddress } = appState;
   //   //----------------------------------------------------------------------------
   const [isTxModalOpen, setIsTxModalOpen] = useState(false); // State for showing transaction modal
   const [txHash, setTxHash] = useState<string>(); // Transaction hash state
   const [isTxError, setIsTxError] = useState(false); // Error state for transaction
   const [txMessage, setTxMessage] = useState(''); // Message related to transaction
   const [txConfirmed, setTxConfirmed] = useState(false); // Confirmation state for transaction
   //   //----------------------------------------------------------------------------

   //   /*
   //     This state is used to control the visibility of the wallet connector modal.
   //     By managing this at the parent component level, it allows child components
   //     to trigger or access the modal state as needed.
   //   */
   const [isWalletConnectorModalOpen, setIsWalletConnectorModalOpen] = useState(false);
   //   //----------------------------------------------------------------------------
   const settersModalTx = { setIsTxModalOpen, setTxHash, setIsTxError, setTxMessage, setTxConfirmed };

   // Function to generate scripts required for transactions using the Lucid library.
   async function generateScripts(lucid: Lucid) {
      let newAppState = { ...appState };

      // Example implementation: The minting policy script here is not parametrized.
      // However, in a real-world scenario, the script could have been exported directly
      // from the smart contract project with parameters applied, making it ready to use.
      if (!(protocolCS === undefined || protocolScript === undefined)) {
         // Apply parameters to the minting policy script.
         const { scriptCbor: otcSmartContractScript, scriptAddr: otcSmartContractAddress } =
            getScript(otcScriptPreScriptCBORHEX, [protocolCS, strToHex(protocolIdTn), strToHex(otcSmartContractPolicyIdTn)], 'V3');


         // Generate the minting policy ID based on the script.
         const otcSmartContractCS = resolveScriptHash(otcSmartContractScript);

         // Update the app state with the generated minting policy ID.
         newAppState = {
            otcSmartContractScript: otcSmartContractScript,
            otcSmartContractAddress: otcSmartContractAddress,
            otcSmartContractCS: otcSmartContractCS,
            ...newAppState,
         };

         // Update the global app state with the new configurations.
         setAppState(newAppState);
      }

      // Set up a synchronization hook for `MarketNFTEntity` with the blockchain,
      // allowing the app to stay updated with the latest data for this entity.
      await BaseSmartDBFrontEndApiCalls.createHookApi(OTCEntity, newAppState.otcSmartContractAddress!, newAppState.otcSmartContractCS!);
   }

   // Effect hook to trigger the script generation when the Lucid instance is available
   useEffect(() => {
      const fetch = async () => {
         if (walletStore._lucidForUseAsUtils === undefined) return;
         try {
            await generateScripts(walletStore._lucidForUseAsUtils); // Generate scripts with Lucid instance
         } catch (e) {
            console.error(e);
         }
      };

      fetch();
   }, [walletStore._lucidForUseAsUtils]);

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
   const { isLoadingDetails, isLoadedDetails, current: walletTokens } = useDetails<TokensWithMetadataAndAmount>({
      nameDetails: 'Balance',
      loadDetails, // Fetches details using the loadDetails function
      dependencies: [walletStore.isWalletDataLoaded], // Dependency on wallet data being loaded
   });

   // Function to load a list of MarketNFTs with metadata
   const loadList = async () => {
      // Fetch all MarketNFT entities with specific fields and relations
      const listEntities: OTCEntity[] = await OTCApi.getAllApi_({
         fieldsForSelect: {},
         loadRelations: { smartUTxO_id: true }, // Load related data for smartUTxO_id
      });

      const listTokensWithMetadata: OTCEntityWithMetadata[] = []; // Array to store MarketNFT entities with their metadata

      if (listEntities.length === 0) return []; // If no entities are found, return an empty list

      // Map the fetched entities to create a list of tokens with their CS and TN
      const listTokens = listEntities.map((item) => {
         return { CS: item.od_token_policy_id, TN_Hex: item.od_token_tn }; // Create a token object with CS and TN
      });

      // Fetch metadata for the tokens
      const listMetadata = await TokenMetadataFrontEndApiCalls.get_Tokens_MetadataApi(listTokens);

      // Combine MarketNFT entities with their corresponding metadata
      for (const item of listEntities) {
         const metadata = listMetadata.find((x) => x.CS === item.od_token_policy_id && x.TN_Hex === item.od_token_tn);
         if (metadata !== undefined) {
            listTokensWithMetadata.push({ entity: item, metadata }); // Push the entity and metadata pair into the list
         }
      }

      return listTokensWithMetadata; // Return the combined list of entities with metadata
   };

   //--------------------------------------
   // Use the `useList` hook from SmartDB to handle pagination and loading of the MarketNFT list
   const { isLoadingList, isLoadedList, list: listOfOtcEntityWithTokens, refreshList } = useList<OTCEntityWithMetadata>({
      nameList: OTCEntity.className(), // Name of the list is the class name of MarketNFTEntity
      loadList, // The function to load the list of MarketNFTs with metadata
   });
   // Sync the market data with the blockchain
   const handleBtnSync = async () => {
      console.log('Syncing MarketNFT data with the blockchain...');
      if (otcSmartContractAddress === undefined) return;
      try {
         // Sync the data and refresh the list
         await OTCApi.syncWithAddressApi(OTCEntity, otcSmartContractAddress, true);
         refreshList();
         pushSucessNotification(`MarketNFT Sync`, 'Synchronization complete!', false);
      } catch (e) {
         console.error(e);
         pushWarningNotification(`MarketNFT Sync`, 'Synchronization Error' + e);
      }
   };

   return {
      sidebarState,
      isWalletConnected: walletStore.isConnected,
      isWalletConnectorModalOpen,
      setIsWalletConnectorModalOpen,
      // -----------------------------
      isTxModalOpen,
      txHash,
      isTxError,
      txMessage,
      txConfirmed,
      // -----------------------------
      settersModalTx,
      walletTokens,
      listOfOtcEntityWithTokens,
      handleBtnSync
   };
};
