// Home.tsx
import Sidebar from "../Sidebar/Sidebar";
import { useHome } from "./useHome";
import styles from "./Home.module.scss";
import Claim from "./Claim/Claim";
import MyArea from "./MyArea/MyArea";
import BtnConnectWallet from "@/components/UI/Buttons/ConnectWallet/BtnConnectWallet";
import ProtocolArea from "./ProtocolArea/ProtocolArea";
import ModalTransaction from "../../Common/ModalTransaction/ModalTransaction";
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

  function renderHome() {
    if (!isWalletConnected) {
      return <text>Please connect, your wallet</text>;
    }

    switch (sidebarState) {
      case "Claim":
        return (
          <Claim
            settersModalTx={settersModalTx}
            walletTokens={walletTokens}
            listOfOtcEntityWithTokens={listOfOtcEntityWithTokens}
          />
        );
      case "My Area":
        return (
          <MyArea
            settersModalTx={settersModalTx}
            walletTokens={walletTokens}
            listOfOtcEntityWithTokens={listOfOtcEntityWithTokens}
          />
        );
      case "Protocol Area":
        return <ProtocolArea settersModalTx={settersModalTx} />;
      default:
        return null;
    }
  }

  return (
    <section className={styles.mainSection}>
      <BtnConnectWallet
        type="primary"
      />
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h4 className={styles.cardCaption}> $MAYZ - Over The Counter</h4>
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
