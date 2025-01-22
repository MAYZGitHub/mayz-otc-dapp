import { IUseWalletStore } from "smart-db";

export const useWalletInfo = (walletStore: IUseWalletStore) => {

   const handleCopyAddress = () => {
      navigator.clipboard.writeText(walletStore.info?.address || '');
    };
  
    const handleCopyPkh = () => {
      navigator.clipboard.writeText(walletStore.info?.pkh || '');
    };
  
    const shortenAddress = (address: string) => {
      if (!address) return '';
      return address.slice(0, 6) + '...' + address.slice(-4);
    };
  
    const shortenPkh = (pkh: string) => {
      if (!pkh) return '';
      return pkh.slice(0, 6) + '...' + pkh.slice(-4);
    };

   return {
      handleCopyAddress,
      handleCopyPkh,
      shortenAddress,
      shortenPkh
   };
};
