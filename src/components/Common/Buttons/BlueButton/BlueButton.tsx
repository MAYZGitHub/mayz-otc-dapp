import React from 'react';
import styles from './BlueButton.module.scss'

interface BlueButtonProps {
  onClick: () => void;
  style: string;
  children: React.ReactNode;
}

const BlueButton: React.FC<BlueButtonProps> = ({ onClick, style, children }) => {

  return (
    <button onClick={onClick} className={`${styles.BlueButton} ${style}`}>
      {children}
    </button>
  );
};

export default BlueButton;
