import { HIDE, REFRESH, SHOW, STATUS_GREEM } from '@/utils/constants/images';
import Image from 'next/image';
import React, { useState } from 'react';
import { CARDANO_WALLETS, COPY, useWalletActions } from 'smart-db';
import styles from './WalletInformationModal.module.scss';
import Toggle from '@/components/Common/Buttons/Toggle/Toggle';
import RedButton from '@/components/Common/Buttons/RedButton/RedButton';

interface WalletInformationModalProps {
    // Define props here
}

const WalletInformationModal: React.FC<WalletInformationModalProps> = (props) => {
    //--------------------------------------
    //  const { closeModal } = useModal();
    const closeModal = undefined;
    //--------------------------------------
    const { session, walletStore, createSignedSession, walletRefresh, walletDisconnect, handleClickToggleAdminMode } = useWalletActions();
    //--------------------------------------
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const [show, setShow] = useState<boolean>(true);
    const walletName = session?.user?.walletName;
    console.log('walletName', walletName);
    const icon = CARDANO_WALLETS.find((wallet) => wallet.wallet === walletName)?.icon;
    const address = session?.user?.address;
    /*     const start = address?.slice(0, 20);
        const end = address?.slice(-1); */

    const handleCopy = () => {
        if (session?.user?.address) {
            navigator.clipboard
                .writeText(session.user.address)
                .then(() => {
                    setCopySuccess(true);
                    setTimeout(() => {
                        setCopySuccess(false);
                    }, 2000);
                })
                .catch((err) => {
                    console.error('Failed to copy: ', err);
                });
        }
    };

    return (
        <article className={styles.container}>
            <div className={styles.layout}>
                <h2 className={styles.title}>Wallet Information</h2>
                <section className={styles.header}>
                    <div
                        className={styles.headerIcon}
                        onClick={() => {
                            walletRefresh();
                        }}
                    >
                        <svg width="24" height="24" className={styles.icon}>
                            <use href={REFRESH}></use>
                        </svg>
                        <span>Refresh</span>
                    </div>
                    <div
                        className={styles.headerIcon}
                        onClick={() => {
                            setShow(!show);
                        }}
                    >
                        <svg width="24" height="24" className={styles.icon}>
                            <use href={show ? HIDE : SHOW}></use>
                        </svg>
                        <span>{show ? 'Hide Balance' : 'Show Balance'}</span>
                    </div>
                    <div className={styles.toogleIcon}>
                        <Toggle
                            isActive={walletStore.info?.isWalletValidatedWithSignedToken || false}
                            onClickToggle={() => {
                                handleClickToggleAdminMode();
                            }}
                            disabled={false}
                            transparent={true}
                        />
                        <span>Admin</span>
                    </div>
                </section>
                <div className={styles.inputInformatiopn}>
                    <label htmlFor="">Address</label>
                    <div className={styles.addressContainer}>
                        <div className={styles.iconInput}>
                            {icon && <Image src={icon.toString()} alt="icon" width={34} height={24} />}
                            <div className={styles.dataContainer}>
                                <span className={styles.wallet_address}>{address}</span>
                            </div>
                        </div>
                        <div onClick={handleCopy}>
                            {copySuccess ? <Image src={STATUS_GREEM} alt="" height={12} width={15} /> : <Image src={COPY.href} alt="" height={12} width={15} />}
                        </div>
                    </div>
                </div>
                <div className={styles.buttonDisconectContainer}>
                    <RedButton
                        onClick={() => {
                            walletDisconnect(closeModal);
                        }}
                        style=''
                    >
                        Disconect Wallet
                    </RedButton>
                </div>
            </div>
        </article>
    );
};

export default WalletInformationModal;
