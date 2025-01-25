// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';

import { useState } from "react";
import { formatTokenNameHexToStr, getAssetOfUTxOs, getUrlForImage, Token_For_Store_With_Validity, Token_With_Metadata_And_Amount, TokenMetadataFrontEndApiCalls, TokensWithMetadataAndAmount, useDetails, useWalletStore } from "smart-db";

export const useMyArea = () => {
   const walletStore = useWalletStore();
   //----------------------------------------------------------------------------
   // State for managing loading and input values for tokens
   const [isLoading, setIsLoading] = useState(false); // Whether the app is loading data
   //----------------------------------------------------------------------------
   const [isLoadingAnyTx, setIsLoadingAnyTx] = useState<string | undefined>(undefined);
   //----------------------------------------------------------------------------

   function cancelBtnHandler() {
      console.log("Cancelar OTC")
   }

   function closeBtnHandler() {
      console.log("close OTC")
   }

   return {
      closeBtnHandler,
      cancelBtnHandler,
      isLoading,
      isLoadingAnyTx,
      setIsLoadingAnyTx,

      //     isWalletConnectorModalOpen,
      //     setIsWalletConnectorModalOpen,
   };
};
