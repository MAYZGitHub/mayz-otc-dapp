import { SidebarMenu } from '@/pages/_app';
import { AppStateContext } from '@/contexts/AppState';

import { useContext } from 'react';
import { useWalletStore } from 'smart-db';

export const useSidebarContent = () => {

    const walletStore = useWalletStore();
    //   //----------------------------------------------------------------------------
    const { appState, setAppState } = useContext(AppStateContext);
    const { sidebarState } = appState;
    //   //----------------------------------------------------------------------------

    function setSideBarState(newSideBarState: SidebarMenu) {
        setAppState({ ...appState, sidebarState: newSideBarState });
    }

    return {
        sidebarState,
        setSideBarState,
        isWalletConnected: walletStore.isConnected,
    };
};
