// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';

import { AppStateContext } from '@/contexts/AppState';
import { Lucid } from "@lucid-evolution/lucid";
import { useContext, useState } from "react";
import { useWalletStore } from "smart-db";

export const useProtocolArea = () => {
   const [pd_mayz_deposit_requirement, set_pd_mayz_deposit_requirement] = useState('');
   const [error, setError] = useState<string | null>(null);

   
   return {  error, pd_mayz_deposit_requirement, set_pd_mayz_deposit_requirement , setError};
};
