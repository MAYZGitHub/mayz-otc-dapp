import { AppStateContext } from '@/contexts/AppState';
import { useModal } from '@/contexts/ModalContext';
import { OTCEntity } from '@/lib/SmartDB/Entities';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { ModalsEnums } from '@/utils/constants/constants';
import { useContext, useEffect, useState } from 'react';
import {
    getAssetOfUTxOs,
    pushSucessNotification,
    pushWarningNotification,
    TokenMetadataEntity,
    TokenMetadataFrontEndApiCalls,
    TokensWithMetadataAndAmount,
    useAppStore,
    useDetails,
    useList,
    useWalletStore,
} from 'smart-db';

export type OTCEntityWithMetadata = {
    entity: OTCEntity; // The OTC entity itself
    metadata: TokenMetadataEntity; // The metadata for the token associated with the entity
};

export const useHome = () => {
    /*
        This store comes from the global store provided by SmartDB.
        It provides all necessary utilities for managing the connected wallet,
        including its state, connection, and interaction with the blockchain.
      */
    const walletStore = useWalletStore();

    //----------------------------------------------------------------------------
    /*
        This store comes from the global store provided by SmartDB.
      */
    const appStore = useAppStore();
   

    //----------------------------------------------------------------------------

    /*
        Access the global application state and state updater function from the AppStateContext.
        These properties allow managing and sharing app-wide states such as `menuClass`, `otcScript`,
        `marketAddress`, and the minting policy configurations across components.
      */
    const { appState, setAppState } = useContext(AppStateContext);

    const { sidebarState } = appState;
    //----------------------------------------------------------------------------

    /*
        This state is used to control the visibility of the wallet connector modal.
        By managing this at the parent component level, it allows child components
        to trigger or access the modal state as needed.
      */
    const [isWalletConnectorModalOpen, setIsWalletConnectorModalOpen] = useState(false);
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
    const {
        isLoadingDetails,
        isLoadedDetails,
        current: walletTokens,
    } = useDetails<TokensWithMetadataAndAmount>({
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
    const {
        isLoadingList,
        isLoadedList,
        list: listOfOtcEntityWithTokens,
        refreshList,
    } = useList<OTCEntityWithMetadata>({
        nameList: OTCEntity.className(), // Name of the list is the class name of MarketNFTEntity
        loadList, // The function to load the list of MarketNFTs with metadata
    });
    // Sync the market data with the blockchain
    const handleBtnSync = async () => {
        console.log('Syncing MarketNFT data with the blockchain...');
        if (appState.protocol === undefined) return;
        try {
            // Sync the data and refresh the list
            await OTCApi.syncWithAddressApi(OTCEntity, appState.protocol.getOTC_Net_Address(), appState.protocol.getOTC_NET_id_CS(), true);
            refreshList();
            pushSucessNotification(`MarketNFT Sync`, 'Synchronization complete!', false);
        } catch (e) {
            console.error(e);
            pushWarningNotification(`MarketNFT Sync`, 'Synchronization Error' + e);
        }
    };

    return {
        appState,
        setAppState,
        sidebarState,
        isWalletConnected: walletStore.isConnected,
        isWalletConnectorModalOpen,
        setIsWalletConnectorModalOpen,
        // -----------------------------
        isTxModalOpen: appStore.showProcessingTx,
        txHash: appStore.processingTxHash,
        isTxError: appStore.isFaildedTx,
        txMessage: appStore.processingTxMessage,
        txConfirmed: appStore.isConfirmedTx,
        settersModalTx: {
            isTxModalOpen: appStore.showProcessingTx,
            setIsTxModalOpen: appStore.setShowProcessingTx,
            txHash: appStore.processingTxHash,
            isTxError: appStore.isFaildedTx,
            txMessage: appStore.processingTxMessage,
            txConfirmed: appStore.isConfirmedTx,
        },
        // -----------------------------
        walletTokens,
        listOfOtcEntityWithTokens,
        handleBtnSync,
    };
};
