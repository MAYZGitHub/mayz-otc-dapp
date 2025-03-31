import { Drawer, DrawerContent } from '@/components/UI/drawer';
//import { useResponsiveContext } from '@/contexts/ResponsiveContext';
import React from 'react';
import Modal from 'react-modal';
import styles from './ModalTemplate.module.scss';

interface ModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    children: React.ReactNode;
}

const ModalTemplate: React.FC<ModalProps> = ({ isOpen, setIsOpen, children }) => {
    //const { screenSize } = useResponsiveContext();

/*     if (screenSize === 'mobile' || screenSize === 'tablet') {
        return (
            <Drawer open={isOpen} onClose={() => setIsOpen(false)}>
                <DrawerContent>
                    <div className={styles.drawerContent}>
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                            <span>x</span>
                        </button>
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    } */

    return (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} overlayClassName={styles.overlay} className={styles.modal}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                    <span>x</span>
                </button>
                {children}
            </div>
        </Modal>
    );
};

export default ModalTemplate;