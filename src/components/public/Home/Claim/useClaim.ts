import debounce from 'lodash/debounce';


import { useCallback, useContext, useMemo, useState } from "react";
import { OTCEntityWithMetadata } from '../useHome';
import { BaseSmartDBFrontEndBtnHandlers, getUrlForImage, hexToStr, Token_With_Metadata_And_Amount, useWalletStore } from 'smart-db';
import { ClaimOTCTxParams } from '@/utils/constants/on-chain';
import { OTCEntity } from '@/lib/SmartDB/Entities';
import { OTCApi } from '@/lib/SmartDB/FrontEnd';
import { AppStateContext } from '@/contexts/AppState';

export const useClaim = (listOfOtcEntityWithTokens: OTCEntityWithMetadata[], walletTokens: Token_With_Metadata_And_Amount[]) => {
   const [searchTerm, setSearchTerm] = useState("");


   const debouncedSetSearchTerm = useCallback(
      debounce((value) => {
        setSearchTerm(value);
      }, 100),
      []
    );
  
    const handleInputChange = (event: any) => {
      debouncedSetSearchTerm(event.target.value);
    };
   const walletStore = useWalletStore();
   //----------------------------------------------------------------------------
   const { appState, setAppState } = useContext(AppStateContext);
   const { } = appState;
   //----------------------------------------------------------------------------


   function filterOtc() {
      return listOfOtcEntityWithTokens.filter((otcEntity) =>
         walletTokens.some((token) => token.CS === otcEntity.entity.od_otc_nft_policy_id)
      );
   }

   async function cancelBtnHandler(id: string) {
    //   if (walletStore.isConnected !== true) return; // Ensure the wallet is connected
    //   if (otcSmartContractAddress === undefined || otcSmartContractScript === undefined || otcSmartContractCS === undefined || protocolCS === undefined) return;

    //   settersModalTx.setIsTxModalOpen(true); // Open transaction modal

    //   settersModalTx.setTxConfirmed(false);
    //   try {
    //      settersModalTx.setTxHash(undefined);
    //      settersModalTx.setIsTxError(false);
    //      settersModalTx.setTxMessage('Creating Transaction...');

    //      const txParams: ClaimOTCTxParams = {
    //         otcDbId: id,
    //         otcSmartContractAddress: otcSmartContractAddress,
    //         otcScript: otcSmartContractScript //TODO: Migrar a Mesh con plutus V3
    //      };
    //      const result = await BaseSmartDBFrontEndBtnHandlers.handleBtnDoTransaction_V1(
    //         OTCEntity,
    //         'Cancel OTC...',
    //         'Cancel Tx',
    //         settersModalTx.setTxMessage,
    //         settersModalTx.setTxHash,
    //         walletStore,
    //         txParams,
    //         OTCApi.callGenericTxApi_.bind(OTCApi, 'claim-tx')
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

      function tokenCardInterface() {
         const otcToClaim = filterOtc();
   
         const mapTokenToInterface = (token: OTCEntityWithMetadata, handler: (id: string) => void) => ({
            key: token.metadata.CS + token.metadata.TN_Hex,
            srcImageToken: getUrlForImage(token.metadata.image),
            photoAlt: hexToStr(token.metadata.TN_Hex),
            tokenName: hexToStr(token.metadata.TN_Hex),
            tokenAmount: token.entity.od_token_amount,
            tokenCS: token.metadata.CS,
            btnHandler: () => handler(token.entity._DB_id),
         });
   
         return otcToClaim.map((token) => mapTokenToInterface(token, cancelBtnHandler));
   
      }

      const filteredItems = useMemo(() => {
        const tokenCards = tokenCardInterface();
        if (!searchTerm) {
          return tokenCards; // Mostrar todos los elementos si el campo de búsqueda está vacío
        }
    
        const lowerSearchTerm = searchTerm.toLowerCase();
    
        return tokenCards.filter(item =>
          item.tokenName.toLowerCase().includes(lowerSearchTerm) ||
          item.tokenCS.toString().includes(searchTerm) ///||
        );
      }, [searchTerm]);
    

   return {
      searchTerm,
      handleInputChange,
      filteredItems
   };
};
