// Home.tsx
import Sidebar from '../Sidebar/Sidebar';
import { useHome } from './useHome';
import styles from './Home.module.scss';
// import Claim from "./Claim/Claim";
// import MyArea from "./MyArea/MyArea";
import BtnConnectWallet from '@/components/UI/Buttons/ConnectWallet/BtnConnectWallet';
import ProtocolArea from './ProtocolArea/ProtocolArea';
import ModalTransaction from '../../Common/ModalTransaction/ModalTransaction';
import { AppStateContext } from '@/contexts/AppState';
import { useContext } from 'react';
export default function Home() {
    const {
        sidebarState,
        isWalletConnectorModalOpen,
        setIsWalletConnectorModalOpen,
        isWalletConnected,
        isTxModalOpen,
        txHash,
        isTxError,
        txMessage,
        txConfirmed,
        settersModalTx,
        listOfOtcEntityWithTokens,
        walletTokens,
        handleBtnSync,
    } = useHome();

    const { appState, setAppState } = useContext(AppStateContext);

    function renderHome() {
        if (!isWalletConnected) {
            return <p>Please connect, your wallet</p>;
        }

        switch (sidebarState) {
            case 'Protocol Area':
                return <ProtocolArea settersModalTx={settersModalTx} />;
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
            <BtnConnectWallet type="primary" />
            <div className={styles.mainContainer}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h4 className={styles.cardCaption}> $MAYZ - Over The Counter</h4>
                        <p>{appState.protocol === undefined ? 'Please Create Protocol' : `Protocol: ${appState.protocol.name}`}</p>
                    </div>
                    {renderHome()}
                </div>
            </div>
            {/* Modal displaying transaction status */}
            <ModalTransaction
                isOpen={isTxModalOpen}
                onRequestClose={() => settersModalTx.setIsTxModalOpen(false)}
                txMessage={txMessage}
                txHash={txHash!}
                txConfirmed={txConfirmed}
                isTxError={isTxError}
            />
        </section>
    );
}
