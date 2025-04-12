import { HandlesEnums, ModalsEnums } from '@/utils/constants/constants';
import { createContext, ReactNode, useContext } from 'react';

export interface IModalContext {
    activeModal: ModalsEnums | null;
    modalData?: Record<string, any>;
    handles?: Partial<Record<HandlesEnums, (data?: Record<string, any>) => Promise<string | undefined | void>>>;
    openModal: (
        modal: ModalsEnums,
        data?: Record<string, any>,
        handles?: Partial<Record<HandlesEnums, (data?: Record<string, any>) => Promise<string | undefined | void>>>,
        component?: ReactNode
    ) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<IModalContext | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
