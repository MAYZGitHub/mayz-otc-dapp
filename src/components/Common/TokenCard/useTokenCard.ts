// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';
// import { applyParamsToScript, Lucid, MintingPolicy } from '@lucid-evolution/lucid';

import { useState } from "react";

export const useTokenCard = () => {
   const [amount, setAmount] = useState(0);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.valueAsNumber);
   };
   

   return {
      amount,
      handleInputChange,
   };
};
