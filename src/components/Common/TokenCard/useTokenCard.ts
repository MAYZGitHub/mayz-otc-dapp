import { useState } from 'react';
const INITIAL_IMAGE_SIZE = 65;

export const useTokenCard = () => {
    const [amount, setAmount] = useState('0');
    const [imageSize, setImageSize] = useState(INITIAL_IMAGE_SIZE);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };
    return {
        amount,
        imageSize,
        handleInputChange,
    };
};
