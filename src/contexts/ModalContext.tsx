
import ModalTemplate from '@/components/UI/Modal/ModalTemplate';
import { WalletSelectorModal } from '@root/src/components/UI/Modal/WalletSelectorModal';
import { createContext, useContext, useState } from 'react';

interface ModalState {
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

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

    const openModal = (modalType: string, options?: Partial<Omit<ModalState, 'modalType'>>) => {
        setModalState({ ...options, modalType, isOpen: true });
    };

    const closeModal = () => {
        setModalState({ isOpen: false });
    };

    const setIsOpen = (isOpen: boolean) => {
        setModalState({ ...modalState, isOpen });
    };

    // Map of modal types to components
    const modalComponents: Record<string, JSX.Element | null> = {
        walletSelector: <WalletSelectorModal />,
    };

    return (
        <>
            <ModalContext.Provider value={{ ...modalState, openModal, closeModal, setIsOpen }}>
                {modalState.modalType !== undefined && (
                    <ModalTemplate isOpen={modalState.isOpen} setIsOpen={setIsOpen}>
                        {modalComponents[modalState.modalType] || undefined}
                    </ModalTemplate>
                )}
                {children}
            </ModalContext.Provider>
        </>
    );
};