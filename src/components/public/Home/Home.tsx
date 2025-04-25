// Home.tsx
import styles from './Home.module.scss';
import { useHome } from './useHome';
// import Claim from "./Claim/Claim";
// import MyArea from "./MyArea/MyArea";
import BtnConnectWallet from '@/components/Common/Buttons/ConnectWallet/BtnConnectWallet';
import ProtocolArea from './ProtocolArea/ProtocolArea';
import MyArea from './MyArea/MyArea';
import Claim from './Claim/Claim';
export default function Home() {
    const { appState, sidebarState, isWalletConnected, listOfOtcEntityWithTokens, walletTokens } = useHome();
    //--------------------------------------
    function renderHome() {
        if (!isWalletConnected) {
            return <p>Please connect, your wallet</p>;
        }

        switch (sidebarState) {
            case 'Protocol Area':
                return <ProtocolArea />;
            case 'Claim':
                return <Claim walletTokens={walletTokens} listOfOtcEntityWithTokens={listOfOtcEntityWithTokens} />;
            case 'My Area':
                return <MyArea walletTokens={walletTokens} listOfOtcEntityWithTokens={listOfOtcEntityWithTokens} />;

            default:
                return null;
        }
    }
    //--------------------------------------
    return (
        <section className={styles.mainSection}>
            <div className={styles.mainContainer}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h4 className={styles.cardCaption}> $MAYZ - Over The Counter</h4>
                        <BtnConnectWallet />
                    </div>
                    <div className={styles.protocolMessage}>
                        <p>{appState.protocol === undefined ? 'Please Create Protocol' : `Protocol: ${appState.protocol.name}`}</p>
                    </div>
                    {renderHome()}
                </div>
            </div>
        </section>
    );
}
