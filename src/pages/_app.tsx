
import { StoreProvider } from 'easy-peasy';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { AppGeneral, CS, globalStore, useAppGeneral } from 'smart-db';
import Layout from '../components/UI/Layout/Layout';
import 'smart-db/dist/styles.css';
// import { Address, MintingPolicy, SpendingValidator } from 'lucid-cardano';
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import '@styles/global.scss';

// import {mintingPolicyIDPreScript, validatorScript } from '../lib/Commons/Constants/onchain';

export type SidebarMenu = 'Claim' | 'My Area'

// // Define the shape of the application state.
export type AppState = {
    sidebarState: string
};

// // Initial state for the app, with default values.
const initialAppState: AppState = {
    sidebarState: 'Claim'
};

// Create a context for managing the app state globally.
export const AppStateContext = createContext<{
    appState: AppState;
    setAppState: Dispatch<SetStateAction<AppState>>; // Function to update the app state.
}>({ appState: initialAppState, setAppState: () => {} });

export default function MyApp({ Component, pageProps }: AppProps<{ session?: Session }>) {
    // Use the useState hook to manage the app state locally within the component.
    const [appState, setAppState] = useState<AppState>(initialAppState);

    const [isLoadingResources, setIsLoadingResources] = useState(true);
    const [isLoadingDatabaseService, setIsLoadingDatabaseService] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            // Ensure initialization logic is complete
            //await dataBaseService.initializeData();

            setIsLoadingDatabaseService(false);
        };

        initialize();
    }, []);

    return (
        // Provide the app state and setter function to the entire app via context.
        <AppStateContext.Provider value={{ appState, setAppState }}>
            {/* Provide session management using next-auth */}
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                {/* Provide the global store from SmartDB for state management */}
                <StoreProvider store={globalStore}>
                    {/* Run the general app component from SmartDB for init procedures */}
                    <AppGeneral />
                    ( isLoadingDatabaseService &&
                    ({/* Include the React Notifications component for global notifications */}
                    <ReactNotifications />
                    {/* Wrap the app content with the Layout component */}
                    <Layout>
                        {/* Render the current page component */}
                        <Component {...pageProps} />
                    </Layout>)
                    )
                </StoreProvider>
            </SessionProvider>
        </AppStateContext.Provider>
    );
}

