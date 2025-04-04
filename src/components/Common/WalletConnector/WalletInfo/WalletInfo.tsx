import React, { useState } from 'react'; // Importing React to create the functional component
import { DISCONNECT, IUseWalletStore } from 'smart-db'; // Importing necessary utilities and types from `smart-db`
import WalletApiKey from './WalletApiKey/WalletApiKey'; // Importing the WalletApiKey component to display the API key modal
import styles from './WalletInfo.module.scss'; // Assuming SCSS module for component-specific styles
import { useWalletInfo } from './useWalletInfo';

// Props interface for the WalletInfo component
interface Props {
    walletStore: IUseWalletStore; // The walletStore holds wallet-related information and functionality
    walletDisconnect: (closeModal?: boolean) => Promise<void>; // Function to disconnect the wallet
}

// Functional component to display wallet information, manage its state and actions
const WalletInfo: React.FC<Props> = ({ walletStore, walletDisconnect }) => {
    const { handleCopyAddress, handleCopyPkh, shortenAddress, shortenPkh } = useWalletInfo(walletStore);

    const svgCopy = (
        <svg
            fill="#FFFFFF"
            height="12px"
            width="12px"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 64 64"
            enable-background="new 0 0 64 64"
            xmlSpace="preserve"
            stroke="#FFFFFF"
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g id="Text-files">
                    <path d="M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228 C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999 c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64 h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002 C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228 c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999 c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003z M56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699 c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946 c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999 h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z"></path>
                    <path d="M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005 c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997 C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z"></path>
                    <path d="M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986 c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016 C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z"></path>{' '}
                    <path d="M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997 S39.16465,29.4603004,38.6031494,29.4603004z"></path>{' '}
                    <path d="M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997 S29.0059509,37.5872993,28.4444485,37.5872993z"></path>
                </g>
            </g>
        </svg>
    );

    //--------------------------------------
    return (
        <>
            {/* Header displaying the wallet type (Seed, Key, or Wallet Name) */}
            <h2 className={styles.walletConnectHeader}>
                YOUR WALLET [
                {
                    walletStore.info!.isWalletFromKey === true
                        ? 'Key' // Display 'Key' if the wallet was created from a key
                        : walletStore.info!.isWalletFromSeed === true
                        ? 'Seed' // Display 'Seed' if the wallet was created from a seed
                        : walletStore.info!.walletName // Display wallet name if it's neither a key nor seed
                }
                ]
            </h2>
            <div className={styles.walletInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Address:</span>
                    <span className={styles.infoValue}>
                        {shortenAddress(walletStore.info?.address!)}
                        <button onClick={handleCopyAddress} className={styles.copyButton}>
                            {svgCopy}
                        </button>
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Public Key:</span>
                    <span className={styles.infoValue}>
                        {shortenPkh(walletStore.info?.pkh!)}
                        <button onClick={handleCopyPkh} className={styles.copyButton}>
                            {svgCopy}
                        </button>
                    </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>UTxOs:</span>
                    <span className={styles.infoValue}>{walletStore.uTxOsAtWallet.length}</span>
                </div>
            </div>
            {/* Grid container for wallet action buttons and information */}
            <div className={styles.buttonGrid}>
                {/* WalletApiKey component to show the API key modal */}
                <WalletApiKey />

                {/* Disconnect wallet button */}
                <button
                    key={walletStore.info!.pkh + ' disconnect'} // Use public key hash (pkh) as part of the button's key for uniqueness
                    className={styles.walletDisc} // Apply styles for the disconnect button
                    onClick={async () => await walletDisconnect(false)} // Trigger wallet disconnect on click
                >
                    Disconnect Wallet {/* Text on the button */}
                </button>
            </div>
        </>
    );
};

export default WalletInfo;
