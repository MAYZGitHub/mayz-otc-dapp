import { createContext, useContext } from 'react';

export interface ModalState {
    isOpen: boolean;
    modalType?: string;
    campaign_id?: number;
    submission?: string;
}

interface ModalContextType extends ModalState {
    openModal: (modalType: string, options?: Partial<Omit<ModalState, 'modalType'>>) => void;
    closeModal: () => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
