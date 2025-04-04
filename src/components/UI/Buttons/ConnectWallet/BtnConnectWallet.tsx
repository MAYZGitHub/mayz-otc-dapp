import { useModal } from '@/contexts/ModalContext';
import { CONNECTED_WALLET_ICON, DISCONNECTED_WALLET_ICON } from '@/utils/constants/images';
import { useState } from 'react';
import { formatAddress, useWalletActions } from 'smart-db';
import styles from './BtnConnectWallet.module.scss';

interface BtnConnectProps {
    type: 'mobile' | 'primary' | 'secondary';
    width?: number;
}

interface SubComponentProps {
    width?: number;
}

interface SecondarySubComponentProps {
    width?: number;
}

const BtnConnectMobile: React.FC<SubComponentProps> = () => {
    //--------------------------------------
    const { walletStore, walletDisconnect } = useWalletActions();
    //--------------------------------------
    const { openModal } = useModal();
    //--------------------------------------
    const [showDisconnect, setShowDisconnect] = useState<boolean>(false);
    //--------------------------------------
    const handleClick = () => {
        if (walletStore.isConnected !== true) {
            openModal('walletSelector');
        } else {
            setShowDisconnect(!showDisconnect);
        }
    };
    //--------------------------------------
    return (
        <button className={`${styles.btnConnectMob} ${walletStore.isConnected === true ? styles.connected : ''}`} onClick={handleClick}>
            <svg width="20" height="20" className={styles.icon}>
                <use href={CONNECTED_WALLET_ICON}></use>
            </svg>
            
            {showDisconnect && (
                <p className={styles.btnDisconnect} onClick={() => walletDisconnect()}>
                    Disconnect
                </p>
            )}
        </button>
    );
};

const BtnConnectPrimary: React.FC<SubComponentProps> = ({ width }) => {
    //--------------------------------------
    const { walletStore, walletDisconnect } = useWalletActions();
    //--------------------------------------
    const { openModal } = useModal();
    //--------------------------------------
    const handleClick = () => {
        if (walletStore.isConnected !== true) {
            openModal('walletSelector');
        } else {
            openModal('walletInformation');
        }
    };
    return (
        <button
            className={`${styles.BtnConnectPrimary} ${walletStore.isConnected === true ? styles.connected : ''}`}
            onClick={handleClick}
            style={width ? { width: `${width}px` } : undefined}
        >
            {walletStore.isConnected !== true ? (
                <p className={styles.text}>Connect wallet</p>
            ) : (
                <>
                    <svg width="20" height="20" className={styles.icon}>
                        <use href={DISCONNECTED_WALLET_ICON}></use>
                    </svg>
                    <p className={styles.text}>{formatAddress(walletStore.info?.address || '')}</p>
                </>
            )}
        </button>
    );
};

const BtnConnectSecondary: React.FC<SecondarySubComponentProps> = ({ width }) => {
    //--------------------------------------
    const { walletStore, walletDisconnect } = useWalletActions();
    //--------------------------------------
    const { openModal } = useModal();
    //--------------------------------------

    const handleClick = () => {
        if (walletStore.isConnected !== true) {
            openModal('walletSelector');
        } else {
            openModal('walletInformation');
        }
    };

    return (
        <button
            className={`${styles.BtnConnectSecondary} ${walletStore.isConnected !== true ? styles.connected : ''}`}
            onClick={handleClick}
            style={width ? { width: `${width}px` } : undefined}
        >
            {walletStore.isConnected !== true ? (
                <p className={styles.text}>Connect wallet</p>
            ) : (
                <>
                    <svg width="20" height="20" className={styles.icon}>
                        <use href={CONNECTED_WALLET_ICON}></use>
                    </svg>
                    <p className={styles.text}>{formatAddress(walletStore.info?.address || '')}</p>
                </>
            )}
        </button>
    );
};

const BtnConnectWallet: React.FC<BtnConnectProps> = ({ type, width }) => {
    switch (type) {
        case 'mobile':
            return <BtnConnectMobile />;
        case 'primary':
            return <BtnConnectPrimary width={width} />;
        case 'secondary':
            return <BtnConnectSecondary width={width} />;
        default:
            return null;
    }
};

export default BtnConnectWallet;
