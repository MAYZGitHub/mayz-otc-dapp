// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';
// import { applyParamsToScript, Lucid, MintingPolicy } from 'lucid-cardano';

import { BlockfrostProvider, MeshWallet } from "@meshsdk/core";
import { AppStateContext } from "@root/src/pages/_app";
import { useContext } from "react";
import { CardanoWallet, useWalletStore } from "smart-db";

interface WalletListProps {
   walletConnect: (wallet: CardanoWallet, createSignedSession: boolean, arg1: boolean, arg2: boolean, arg3: boolean) => Promise<void>;
   createSignedSession: boolean;
}

interface AppState {
   meshWallet?: MeshWallet;
}


export const useWalletList = ({ walletConnect, createSignedSession }: WalletListProps) => {
   const walletStore = useWalletStore();
   const { appState, setAppState } = useContext(AppStateContext)


   async function walletConnect_(wallet: CardanoWallet): Promise<void> {
      await walletConnect(wallet, createSignedSession, true, false, true);
      const blockChainProvider= new BlockfrostProvider(process.env.BLOCKFROST_KEY_PREVIEW!)

      setAppState({...appState, blockChainProvider: blockChainProvider})



      if (walletStore.info?.address != undefined && walletStore.info?.address != "") {
         const meshWallet = new MeshWallet({
            networkId: 0,
            fetcher: blockChainProvider,
            submitter: blockChainProvider,
            key: {
               type: "address",
               address: walletStore.info?.address!,
            },
         });

         setAppState({ ...appState, meshWallet: meshWallet });
      }
   }
   return {
      walletConnect_,
      // setIsWalletConnectorModalOpen,
   };
};
