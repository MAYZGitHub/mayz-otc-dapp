
import { AppStateContext } from "@root/src/pages/_app";
import { useContext, useEffect, useState } from "react";
import { useWalletStore } from "smart-db";

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

   //   /*
   //     This state is used to control the visibility of the wallet connector modal.
   //     By managing this at the parent component level, it allows child components
   //     to trigger or access the modal state as needed.
   //   */
   const [isWalletConnectorModalOpen, setIsWalletConnectorModalOpen] = useState(false);
   //   //----------------------------------------------------------------------------

   return {
      sidebarState,
      isWalletConnected: walletStore.isConnected,
      isWalletConnectorModalOpen,
      setIsWalletConnectorModalOpen,
   };
};
