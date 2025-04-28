// Home.tsx
import styles from './Home.module.scss';
import { useHome } from './useHome';
import BtnConnectWallet from '@/components/Common/Buttons/ConnectWallet/BtnConnectWallet';
import ProtocolArea from './ProtocolArea/ProtocolArea';
import MyArea from './MyArea/MyArea';
import Claim from './Claim/Claim';
import { useWalletSession } from 'smart-db';
export default function Home() {
    const { appState, sidebarState, isWalletConnected, listOfOtcEntityWithTokens, walletTokens } = useHome();
    //--------------------------------------
    // para que cargue la sesion del wallet
    useWalletSession();
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
