import { ProtocolEntity } from '@/lib/SmartDB/Entities';
import { createContext, Dispatch, SetStateAction } from 'react';

// // Define the shape of the application state.

export type AppState = {
    // Global state variables
    sidebarState: string;
    protocol?: ProtocolEntity;
};
// // Initial state for the app, with default values.
export const initialAppState: AppState = {
    sidebarState: 'Protocol Area',
};
// Create a context for managing the app state globally.

export const AppStateContext = createContext<{
    appState: AppState;
    setAppState: Dispatch<SetStateAction<AppState>>; // Function to update the app state.
}>({ appState: initialAppState, setAppState: () => { } });
