import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CardanoWallet, LoadingSpinner, isEmulator, useWalletActions } from 'smart-db';
import Toggle from '../Buttons/Toggle/Toggle';
import styles from './ModalTemplate.module.scss';
import { useModal } from '@/contexts/ModalContext';

export const WalletSelectorModal: React.FC = () => {
    //--------------------------------------
    const [availableWallets, setAvailableWallets] = useState<CardanoWallet[]>([]);
    const [unAvailableWallets, setUnAvailableWallets] = useState<CardanoWallet[]>([]);
    //--------------------------------------
    const { walletStore, walletSelected, createSignedSession, setCreateSignedSession, walletConnect, walletFromSeedConnect, walletFromKeyConnect, walletInstall } =
        useWalletActions();
    //--------------------------------------
    const [availableWalletsSeeds, setAvailableWalletsSeeds] = useState<Record<string, string>>({});
    const [availableWalletsKeys, setAvailableWalletsKeys] = useState<Record<string, string>>({});
    //--------------------------------------
    useEffect(() => {
        const available: CardanoWallet[] = [];
        const unAvailable: CardanoWallet[] = [];
        walletStore.cardanoWallets.forEach((wallet) => {
            if (wallet.isInstalled) {
                available.push(wallet);
            } else {
                unAvailable.push(wallet);
            }
        });
        setAvailableWallets(available);
        setUnAvailableWallets(unAvailable);
        setAvailableWalletsSeeds({ 'Master 1': process.env.NEXT_PUBLIC_walletMasterSeed1!, 'Master 2': process.env.NEXT_PUBLIC_walletMasterSeed2! });
    }, [walletStore.cardanoWallets]);
    //--------------------------------------
    useEffect(() => {
        if (walletStore.emulatorDB !== undefined) {
            const privateKeys: Record<string, string> = walletStore.emulatorDB.privateKeys.reduce((acc: Record<string, string>, key: string, index: number) => {
                acc[`Emulator ${index + 1}`] = key;
                return acc;
            }, {});
            setAvailableWalletsKeys(privateKeys);
        }
    }, [walletStore.emulatorDB]);
    //--------------------------------------
    const { closeModal, isOpen } = useModal();
    //--------------------------------------
    function showWalletButtons() {
        return (
            <>
                {availableWallets.map((wallet) => (
                    <li
                        key={wallet.name}
                        className={`${styles.walletItem} ${styles.available}`}
                        onClick={async () => {
                            if (wallet.isInstalled === true) {
                                await walletConnect(wallet, createSignedSession, true, true, closeModal);
                            }
                        }}
                    >
                        <Image width={50} height={50} alt={`${wallet.name} icon`} src={wallet.icon.toString()} className={styles.walletIcon} />
                        <span className={styles.walletName}>{wallet.name}</span>
                        {walletStore.isConnecting && walletSelected === wallet.wallet && <LoadingSpinner />}
                    </li>
                ))}
                {unAvailableWallets.map((wallet) => (
                    <Link key={wallet.name} href={wallet.link} target="_blank" rel="noopener noreferrer" passHref>
                        <li
                            key={wallet.name}
                            className={`${styles.walletItem} ${styles.unAvailable}`}
                            onClick={async () => {
                                if (wallet.isInstalled === false) {
                                    await walletInstall(wallet);
                                }
                            }}
                        >
                            <Image width={60} height={60} alt={`${wallet.name} icon`} src={wallet.icon.toString()} className={styles.walletIcon} />
                            <div className={styles.walletLine}>
                                <span className={styles.walletName}>{wallet.name}</span>
                                <span className={styles.walletName}>Install</span>
                            </div>{' '}
                        </li>
                    </Link>
                ))}
            </>
        );
    }
    //--------------------------------------
    function showWalletsFromSeedButton() {
        return (
            <>
                {Object.entries(availableWalletsSeeds).map(([name, seed]) => (
                    <li
                        key={'Wallet ' + name + ' - Seed'}
                        className={`${styles.walletItem} ${styles.available}`}
                        onClick={async () => await walletFromSeedConnect(name, seed, createSignedSession, true, closeModal)}
                    >
                        <span className={styles.walletName}>{name}</span>
                        {walletStore.isConnecting && walletSelected === name && <LoadingSpinner />}
                    </li>
                ))}
            </>
        );
    }
    //--------------------------------------
    function showKeysWalletButtons() {
        return (
            <>
                {Object.entries(availableWalletsKeys).length > 0 ? (
                    Object.entries(availableWalletsKeys).map(([name, key], index) => (
                        <li
                            key={'Wallet ' + name + ' - Key'}
                            className={`${styles.walletItem} ${styles.available}`}
                            onClick={async () => await walletFromKeyConnect(name, key, createSignedSession, true, closeModal)}
                        >
                            <span className={styles.walletName}>{name}</span>
                            {walletStore.isConnecting && walletSelected === name && <LoadingSpinner />}
                        </li>
                    ))
                ) : (
                    <>Loading emulator wallets</>
                )}
            </>
        );
    }
    //--------------------------------------
    const handleClickToggle = () => {
        if (createSignedSession === true) {
            setCreateSignedSession(false);
        } else {
            setCreateSignedSession(true);
        }
    };
    //--------------------------------------
    return (
        <article className={styles.container}>
            <div className={styles.layout}>
                <h2 className={styles.title}>Connect {process.env.NEXT_PUBLIC_CARDANO_NET} Wallet</h2>

                <section className={styles.bodyModal}>
                    <ul className={styles.walletList}>
                        {isEmulator ? (
                            showKeysWalletButtons()
                        ) : (
                            <>
                                {showWalletButtons()}
                                {showWalletsFromSeedButton()}
                            </>
                        )}
                    </ul>
                    <div className={styles.toogleIcon}>
                        <Toggle
                            isActive={createSignedSession}
                            onClickToggle={() => {
                                handleClickToggle();
                            }}
                            disabled={false}
                            transparent={true}
                        />
                        <span>Admin</span>
                    </div>
                </section>
            </div>
        </article>
    );
};
