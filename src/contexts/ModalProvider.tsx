import ModalTemplate from '@/components/UI/Modal/ModalTemplate';
import { WalletSelectorModal } from '@/components/UI/Modal/WalletSelectorModal';
import { useState } from 'react';
import { ModalContext, ModalState } from './ModalContext';

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
