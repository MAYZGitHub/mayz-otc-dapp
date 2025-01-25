
import { AppStateContext } from "@root/src/pages/_app";
import { useContext, useEffect, useState } from "react";
import { useWalletStore } from "smart-db";

export interface SettersModalTx{
   setIsTxModalOpen: (value: boolean) => void;
   setTxHash: (value: string) => void;
   setIsTxError: (value: boolean) => void;
   setTxMessage: (value: string) => void;
   setTxConfirmed: (value: boolean) => void;
}

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
   const { sidebarState } = appState;
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
      settersModalTx
   };
};
