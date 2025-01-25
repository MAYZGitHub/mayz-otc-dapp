// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';
// import { applyParamsToScript, Lucid, MintingPolicy } from 'lucid-cardano';

import { formatTokenNameHexToStr, getAssetOfUTxOs, getUrlForImage, Token_With_Metadata_And_Amount, TokenMetadataFrontEndApiCalls, TokensWithMetadataAndAmount, useDetails, useWalletStore } from "smart-db";
import { SettersModalTx } from "../../useHome";
import { useState } from "react";

export const useYourTokenSeccion = (settersModalTx: SettersModalTx) => {
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

   function deployBtnHandler(token: Token_With_Metadata_And_Amount) {
      console.log(`Deploy me ${formatTokenNameHexToStr(token.TN_Hex)}`)
   }

   function tokenCardInterface() {
      const tokens = current?.slice(1)

      return tokens?.map(token => {
         return {
            srcImageToken: getUrlForImage(token.image),
            photoAlt: formatTokenNameHexToStr(token.TN_Hex),
            tokenName: formatTokenNameHexToStr(token.TN_Hex),
            tokenAmount: token.amount,
            btnHandler: deployBtnHandler(token)
         }
      })

   }

   return {
      deployBtnHandler,

      isLoadingDetails,
      isLoadedDetails,
      current,
      tokenCardInterface
      //     isWalletConnectorModalOpen,
      //     setIsWalletConnectorModalOpen,
   };
};
