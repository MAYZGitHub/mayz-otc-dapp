import React from 'react';

interface GreenButtonProps {
    onClick: () => void;
    style: string;
    children: React.ReactNode;
}

const GreenButton: React.FC<GreenButtonProps> = ({ onClick, style, children }) => {
    return (
        <button onClick={onClick} className={style}>
            {children}
        </button>
    );
};

export default GreenButton;
