// import { useContext, useEffect, useState } from 'react';
// import { xxxEntity } from '@/lib/SmartDB/Entities/xxx.Entity';
// import { CS, useWalletStore } from 'smart-db';
// import { AppStateContext } from '@/pages/_app';

import { AppStateContext } from "@root/src/pages/_app";
import { Lucid } from "lucid-cardano";
import { useContext, useState } from "react";
import { useWalletStore } from "smart-db";

export const useProtocolArea = () => {
   const [mayzMinimo, setMayzMinimo] = useState('');
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Evita la recarga de la página

      if (!mayzMinimo) {
         setError('Por favor, ingresa un valor.');
         return;
      }

      const mayzMinimoNumber = Number(mayzMinimo);

      if (isNaN(mayzMinimoNumber)) {
         setError("Por favor, ingresa un número válido")
         return
      }

      if (mayzMinimoNumber < 0) {
         setError("Por favor, ingresa un número positivo")
         return
      }

      setError(null);
      setMayzMinimo(''); // Limpia el input después del envío
   };
   return { handleSubmit, error, mayzMinimo, setMayzMinimo };
};
