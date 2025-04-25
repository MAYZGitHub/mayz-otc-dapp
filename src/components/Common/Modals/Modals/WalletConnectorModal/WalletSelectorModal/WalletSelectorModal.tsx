import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CardanoWallet, isEmulator, useAppStore, useWalletActions } from 'smart-db';
import styles from './WalletSelectorModal.module.scss';
import Toggle from '@/components/Common/Buttons/Toggle/Toggle';
import LoaderButton from '@/components/Common/LoaderButton/LoaderButton';

export const WalletSelectorModal: React.FC = () => {
    const closeModal = undefined;
    const appStore = useAppStore();

    const [availableWallets, setAvailableWallets] = useState<CardanoWallet[]>([]);
    const [unAvailableWallets, setUnAvailableWallets] = useState<CardanoWallet[]>([]);
    const [availableWalletsSeeds, setAvailableWalletsSeeds] = useState<Record<string, string>>({});
    const [availableWalletsKeys, setAvailableWalletsKeys] = useState<Record<string, string>>({});

    const { walletStore, walletSelected, createSignedSession, setCreateSignedSession, walletConnect, walletFromSeedConnect, walletFromKeyConnect, walletInstall } =
        useWalletActions();

    useEffect(() => {
        const available: CardanoWallet[] = [];
        const unAvailable: CardanoWallet[] = [];

        walletStore.cardanoWallets.forEach((wallet) => {
            wallet.isInstalled ? available.push(wallet) : unAvailable.push(wallet);
        });

        setAvailableWallets(available);
        setUnAvailableWallets(unAvailable);

        setAvailableWalletsSeeds({
            'Master 1': process.env.NEXT_PUBLIC_walletMasterSeed1!,
            'Master 2': process.env.NEXT_PUBLIC_walletMasterSeed2!,
        });
    }, [walletStore.cardanoWallets]);

    useEffect(() => {
        if (walletStore.emulatorDB !== undefined) {
            const keys = walletStore.emulatorDB.privateKeys.reduce((acc: Record<string, string>, key: string, index: number) => {
                acc[`Emulator ${index + 1}`] = key;
                return acc;
            }, {});
            setAvailableWalletsKeys(keys);
        }
    }, [walletStore.emulatorDB]);

    const handleClickToggle = () => {
        setCreateSignedSession(!createSignedSession);
    };

    function showWalletButtons() {
        return (
            <>
                {availableWallets.map((wallet) => (
                    <li
                        key={wallet.name}
                        className={`${styles.walletItem} ${styles.available}`}
                        onClick={async () => {
                            if (wallet.isInstalled) {
                                await walletConnect(wallet, createSignedSession, true, true, closeModal);
                            }
                        }}
                    >
                        <Image width={36} height={36} alt={`${wallet.name} icon`} src={wallet.icon.toString()} className={styles.walletIcon} />
                        <div className={styles.walletLine}>
                            <span>{wallet.name}</span>
                        </div>
                        {walletStore.isConnecting && walletSelected === wallet.wallet && <LoaderButton />}
                    </li>
                ))}

                {unAvailableWallets.map((wallet) => (
                    <Link key={wallet.name} href={wallet.link} target="_blank" rel="noopener noreferrer" passHref>
                        <li
                            className={`${styles.walletItem} ${styles.unAvailable}`}
                            onClick={async () => {
                                if (!wallet.isInstalled) {
                                    await walletInstall(wallet);
                                }
                            }}
                        >
                            <Image width={36} height={36} alt={`${wallet.name} icon`} src={wallet.icon.toString()} className={styles.walletIcon} />
                            <div className={styles.walletLine}>
                                <span>{wallet.name}</span>
                                <span>Install</span>
                            </div>
                        </li>
                    </Link>
                ))}
            </>
        );
    }

    function showWalletsFromSeedButtons() {
        return Object.entries(availableWalletsSeeds).map(([name, seed]) => (
            <li
                key={`Wallet ${name} - Seed`}
                className={`${styles.walletItem} ${styles.available}`}
                onClick={async () => await walletFromSeedConnect(name, seed, createSignedSession, true, closeModal)}
            >
                <span>{name}</span>
                {walletStore.isConnecting && walletSelected === name && <LoaderButton />}
            </li>
        ));
    }

    function showKeysWalletButtons() {
        return Object.entries(availableWalletsKeys).length > 0 ? (
            Object.entries(availableWalletsKeys).map(([name, key]) => (
                <li
                    key={`Wallet ${name} - Key`}
                    className={`${styles.walletItem} ${styles.available}`}
                    onClick={async () => await walletFromKeyConnect(name, key, createSignedSession, true, closeModal)}
                >
                    <span>{name}</span>
                    {walletStore.isConnecting && walletSelected === name && <LoaderButton />}
                </li>
            ))
        ) : (
            <>Loading emulator wallets</>
        );
    }

    return (
        <article className={styles.container}>
            <div className={styles.layout}>
                <h2>Connect {process.env.NEXT_PUBLIC_CARDANO_NET} Wallet</h2>

                <section className={styles.bodyModal}>
                    <ul className={styles.walletList}>
                        {isEmulator ? (
                            showKeysWalletButtons()
                        ) : (
                            <>
                                {showWalletButtons()}
                                {appStore.siteSettings?.debug && showWalletsFromSeedButtons()}
                            </>
                        )}
                    </ul>

                    <div className={styles.toogleIcon}>
                        <Toggle isActive={createSignedSession} onClickToggle={handleClickToggle} disabled={false} transparent={true} />
                        <span>Admin</span>
                    </div>
                </section>
            </div>
        </article>
    );
};
