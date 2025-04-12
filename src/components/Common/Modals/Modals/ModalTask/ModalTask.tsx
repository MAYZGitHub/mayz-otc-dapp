import React from 'react';
import styles from './ModalTask.module.scss';
import { useModalTask } from './useModalTask';
import { isNullOrBlank } from 'smart-db';

// ModalTransaction component definition
const ModalTask: React.FC = () => {
    // Import custom hooks for clipboard copy state and handler function
    const { isModalOpen, txHash, isTxError, txMessage, txConfirmed, copied, handleCopyToClipboard } = useModalTask();

    return (
        // Render the modal with various transaction details
        <article className={styles.container}>
            <div className={styles.layout}>
                {/* Modal title */}
                <h2 className={styles.title}>Operation Status</h2>

                {/* Display transaction message in a read-only textarea */}
                {!isNullOrBlank(txMessage) && <textarea value={txMessage} readOnly className={styles.textarea}></textarea>}

                {/* Display transaction status: Confirmed, Error, or Waiting */}
                <div className={styles.transDiv}>
                    <span className={styles.transText}>Status:</span>
                    <div className={`${styles.status} ${txConfirmed ? styles.confirmed : isTxError ? styles.error : styles.waiting}`}>
                        {txConfirmed ? 'Completed' : isTxError ? 'Error' : 'Waiting...'}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ModalTask;
