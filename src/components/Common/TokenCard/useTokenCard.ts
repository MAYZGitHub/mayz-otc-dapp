import { useState } from "react";
export const useTokenCard = () => {
   const [amount, setAmount] = useState('0');
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
   };
   return {
      amount,
      handleInputChange,
   };
};
