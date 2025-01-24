// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
import { AppStateContext, SidebarMenu } from '@/pages/_app';
// import { applyParamsToScript, Lucid, MintingPolicy } from 'lucid-cardano';

import { useContext } from "react";
import { useWalletStore } from 'smart-db';

export const useSidebarContent = () => {
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

   function setSideBarState(newSideBarState: SidebarMenu) {
      setAppState({ ...appState, sidebarState: newSideBarState })
   }

   return {
      sidebarState,
      setSideBarState,
      isWalletConnected: walletStore.isConnected,
      //     isWalletConnectorModalOpen,
      //     setIsWalletConnectorModalOpen,
   };
};
