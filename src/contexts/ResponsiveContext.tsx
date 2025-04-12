import { createContext, useContext } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'tablet-large' | 'desktop';

export interface IResponsiveContext {
    screenSize: ScreenSize;
}

export const ResponsiveContext = createContext<IResponsiveContext | undefined>(undefined);

export const useResponsive = () => {
    const context = useContext(ResponsiveContext);

    if (!context) {
        throw new Error('useResponsiveContext must be used within a Responsive Provider');
    }
    return context;
};


