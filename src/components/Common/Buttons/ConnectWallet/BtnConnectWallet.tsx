import { useModal } from '@/contexts/ModalContext';
import { ADA } from '@/utils/constants/images';
import { formatAddress, useWalletActions } from 'smart-db';
import { ModalsEnums } from '@/utils/constants/constants';
import Image from 'next/image';
import React from 'react';
import styles from './BtnConnectWallet.module.scss';

const BtnConnectWallet: React.FC = () => {
  const { walletStore } = useWalletActions();
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(ModalsEnums.WALLET_CONNECT);
  };

  return (
    <button onClick={handleClick} className={styles.btnConnectWallet}>
      {walletStore.isConnected ? (
        <>
          <Image width={20} height={20} src={ADA} alt="ada-logo" />
          <span >
            {formatAddress(walletStore.info?.address || '')}
          </span>
        </>
      ) : (
        <>Connect wallet</>
      )}
    </button>
  );
};

export default BtnConnectWallet;
