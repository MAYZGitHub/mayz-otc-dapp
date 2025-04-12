import React from 'react';
import Modal from 'react-modal';
import styles from './ModalTemplate.module.scss';
import { ModalsEnums } from '@/utils/constants/constants';
import { useModal } from '@/contexts/ModalContext';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Drawer, DrawerContent } from '../Drawer/Drawer';

interface ModalProps {
    active: ModalsEnums | null;
    children: React.ReactNode;
}

// 🔹 Fix: Define the app root for accessibility
if (typeof window !== 'undefined') {
    Modal.setAppElement('#__next'); // Ensure it only runs on the client
}

const ModalTemplate: React.FC<ModalProps> = ({ active, children }) => {
    const { activeModal, closeModal } = useModal();
    const { screenSize } = useResponsive();

    // if (activeModal === null || activeModal !== active) return null;

    if (screenSize === 'mobile' || screenSize === 'tablet') {
        return (
            <Drawer open={activeModal === active} onClose={() => closeModal()}>
                <DrawerContent>
                    <div className={styles.drawerContent}>
                        <button className={styles.closeButton} onClick={() => closeModal()}>
                            <span>x</span>
                        </button>
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
    return (
        <Modal isOpen={activeModal === active} onRequestClose={() => closeModal()} overlayClassName={styles.overlay} className={styles.modal}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={() => closeModal()}>
                    <span>x</span>
                </button>
                {children}
            </div>
        </Modal>
    );
};

export default ModalTemplate;
