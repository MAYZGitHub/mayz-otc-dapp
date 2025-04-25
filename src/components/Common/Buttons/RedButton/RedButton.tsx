import React from 'react';
import styles from './RedButton.module.scss';

interface RedButtonProps {
    onClick: () => void;
    style: string;
    children: React.ReactNode;
}

const RedButton: React.FC<RedButtonProps> = ({ onClick, style, children }) => {
    return (
        <button onClick={onClick} className={`${styles.RedButton} ${style}`}>
            {children}
        </button>
    );
};

export default RedButton;
