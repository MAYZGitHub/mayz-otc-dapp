import { useWalletActions } from 'smart-db';
import WalletInformationModal from './WalletInformationModal/WalletInformationModal';
import { WalletSelectorModal } from './WalletSelectorModal/WalletSelectorModal';

const WalletConnectorModal: React.FC = () => {
    const { walletStore } = useWalletActions();

    return <>{walletStore.isConnected ? <WalletInformationModal /> : <WalletSelectorModal />}</>;
};

export default WalletConnectorModal;
