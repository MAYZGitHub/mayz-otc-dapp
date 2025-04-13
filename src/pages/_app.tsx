import Layout from '@/components/UI/Layout/Layout';
import { ModalProvider } from '@/contexts/ModalProvider';
import { ResponsiveProvider } from '@/contexts/ResponsiveProvider';
import { ProtocolEntity } from '@/lib/SmartDB/Entities';
import { ProtocolApi } from '@/lib/SmartDB/FrontEnd';
import '@/styles/global.scss';
import { StoreProvider } from 'easy-peasy';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { AppGeneral, globalStore } from 'smart-db';
import 'smart-db/dist/styles.css';
import { AppState, AppStateContext, initialAppState } from '../contexts/AppState';

export type SidebarMenu = 'Claim' | 'My Area' | 'Protocol Area';

export default function MyApp({ Component, pageProps }: AppProps<{ session?: Session }>) {
    // Use the useState hook to manage the app state locally within the component.
    const [appState, setAppState] = useState<AppState>(initialAppState);

    const [isLoadingApp, setIsLoadingApp] = useState(true);
    const [isLoadingProtocol, setIsLoadingProtocol] = useState(true);

    const fetchProtocol = async () => {
        
        setIsLoadingProtocol(true); 

        // Example: fetch your protocol entity from SmartDB
        const protocol: ProtocolEntity | undefined = await ProtocolApi.getOneByParamsApi_(); // You must define this function

        // Update the context
        setAppState((prev) => ({ ...prev, protocol }));

        setIsLoadingProtocol(false); // Set loading to false after fetching the protocol
    };

    useEffect(() => {
        const initialize = async () => {
            await fetchProtocol();
        };
        if (isLoadingApp === false) {
            initialize();
        }
    }, [isLoadingApp]);

    return (
        <>
            {/* Include the React Notifications component for global notifications */}
            <ReactNotifications />
            {/* // Provide the app state and setter function to the entire app via context. */}
            <AppStateContext.Provider value={{ appState, setAppState }}>
                {/* Provide session management using next-auth */}
                <SessionProvider session={pageProps.session} refetchInterval={0}>
                    {/* Provide the global store from SmartDB for state management */}
                    <StoreProvider store={globalStore}>
                        {/* Run the general app component from SmartDB for init procedures */}
                        <AppGeneral loader={<></>} onLoadComplete={() => setIsLoadingApp(false)}>
                            {!isLoadingProtocol && (
                                <ResponsiveProvider>
                                    <ModalProvider>
                                        {/* Wrap the app content with the Layout component */}
                                        <Layout>
                                            {/* Render the current page component */}
                                            <Component {...pageProps} />
                                        </Layout>
                                    </ModalProvider>
                                </ResponsiveProvider>
                            )}
                        </AppGeneral>
                    </StoreProvider>
                </SessionProvider>
            </AppStateContext.Provider>
        </>
    );
}
