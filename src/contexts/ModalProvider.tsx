import WalletConnectorModal from '@/components/Common/Modals/Modals/WalletConnectorModal/WalletConnectorModal';
import ModalTemplate from '@/components/Common/Modals/ModalTemplate/ModalTemplate';
import { HandlesEnums, ModalsEnums } from '@/utils/constants/constants';
import { ReactNode, useState } from 'react';
import { ModalContext } from './ModalContext';
import ModalTransaction from '@/components/Common/Modals/Modals/ModalTransaction/ModalTransaction';
import ModalTask from '../components/Common/Modals/Modals/ModalTask/ModalTask';
export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [activeModal, setActiveModal] = useState<ModalsEnums | null>(null);
    const [modalData, setModalData] = useState<Record<string, any> | undefined>(undefined);
    const [handles, setHandles] = useState<Partial<Record<HandlesEnums, (data?: Record<string, any>) => Promise<string | undefined | void>>> | undefined>(undefined);
    const [dynamicModal, setDynamicModal] = useState<ReactNode | null>(null);

    const openModal = (
        modal: ModalsEnums,
        data?: Record<string, any>,
        handles?: Partial<Record<HandlesEnums, (data?: Record<string, any>) => Promise<string | undefined | void>>>,
        component?: ReactNode
    ) => {
        setActiveModal(modal);
        setModalData(data || undefined);
        setHandles(handles || undefined);
        setDynamicModal(component || null);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalData(undefined);
        setHandles(undefined);
        setDynamicModal(null);
    };

    // Predefined modals
    const modalComponents: Partial<Record<ModalsEnums, JSX.Element>> = {
        [ModalsEnums.WALLET_CONNECT]: <WalletConnectorModal />,
        [ModalsEnums.PROCESSING_TASK]: <ModalTask />,
        [ModalsEnums.PROCESSING_TX]: <ModalTransaction />,
        // [ModalsEnums.CONFIRM_TX]: <TxUserConfirmationModal />,
    };

    return (
        <ModalContext.Provider
            value={{
                activeModal,
                modalData,
                handles,
                openModal,
                closeModal,
            }}
        >
            {activeModal !== null && (
                <ModalTemplate active={activeModal}>
                    {/* Use predefined modal if available, otherwise fallback to dynamic modal */}
                    {modalComponents[activeModal] || dynamicModal || <>Modal {activeModal} Not Implemented</>}
                </ModalTemplate>
            )}

            {children}
        </ModalContext.Provider>
    );
};
