import { useState, useCallback, useEffect } from 'react';
import { ScreenSize, ResponsiveContext } from './ResponsiveContext';


export const ResponsiveProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const [screenSize, setScreenSize] = useState<ScreenSize>('mobile');

    const updateScreenSize = useCallback(() => {
        if (window.matchMedia('(max-width: 640px)').matches) {
            setScreenSize('mobile');
        } else if (window.matchMedia('(max-width: 768px)').matches) {
            setScreenSize('tablet');
        } else if (window.matchMedia('(max-width: 1024px)').matches) {
            setScreenSize('tablet-large');
        } else {
            setScreenSize('desktop');
        }
    }, []);

    useEffect(() => {
        const mobileQuery = window.matchMedia('(max-width: 640px)');
        const tabletQuery = window.matchMedia('(min-width: 641px) and (max-width: 768px)');
        const tabletLargeQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');

        updateScreenSize();

        mobileQuery.addEventListener('change', updateScreenSize);
        tabletQuery.addEventListener('change', updateScreenSize);
        tabletLargeQuery.addEventListener('change', updateScreenSize);

        return () => {
            mobileQuery.removeEventListener('change', updateScreenSize);
            tabletQuery.removeEventListener('change', updateScreenSize);
            tabletLargeQuery.removeEventListener('change', updateScreenSize);
        };
    }, [updateScreenSize]);

    return <ResponsiveContext.Provider value={{ screenSize }}>{children}</ResponsiveContext.Provider>;
};
