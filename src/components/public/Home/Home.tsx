// Home.tsx
import styles from './Home.module.scss';
import { useHome } from './useHome';
// import Claim from "./Claim/Claim";
// import MyArea from "./MyArea/MyArea";
import BtnConnectWallet from '@/components/Common/Buttons/ConnectWallet/BtnConnectWallet';
import ProtocolArea from './ProtocolArea/ProtocolArea';
export default function Home() {
    const {
        appState,
        sidebarState,
        isWalletConnectorModalOpen,
        setIsWalletConnectorModalOpen,
        isWalletConnected,
        settersModalTx,
        listOfOtcEntityWithTokens,
        walletTokens,
        handleBtnSync,
    } = useHome();

    function renderHome() {
        if (!isWalletConnected) {
            return <p>Please connect, your wallet</p>;
        }

        switch (sidebarState) {
            case 'Protocol Area':
                return <ProtocolArea />;
            case 'Claim':
            // return (
            //   // <Claim
            //   //   settersModalTx={settersModalTx}
            //   //   walletTokens={walletTokens}
            //   //   listOfOtcEntityWithTokens={listOfOtcEntityWithTokens}
            //   // />
            // );
            case 'My Area':
            // return (
            //   // <MyArea
            //   //   settersModalTx={settersModalTx}
            //   //   walletTokens={walletTokens}
            //   //   listOfOtcEntityWithTokens={listOfOtcEntityWithTokens}
            //   // />
            // );

            default:
                return null;
        }
    }

    return (
        <section className={styles.mainSection}>
            <BtnConnectWallet />
            <div className={styles.mainContainer}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h4 className={styles.cardCaption}> $MAYZ - Over The Counter</h4>
                        <p>{appState.protocol === undefined ? 'Please Create Protocol' : `Protocol: ${appState.protocol.name}`}</p>
                    </div>
                    {renderHome()}
                </div>
            </div>
        </section>
    );
}
