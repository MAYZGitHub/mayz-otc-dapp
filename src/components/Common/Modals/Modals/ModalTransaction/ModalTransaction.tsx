import React from 'react';
import styles from './ModalTransaction.module.scss';
import { useModalTransaction } from './useModalTransaction';
import { isNullOrBlank } from 'smart-db';

// ModalTransaction component definition
const ModalTransaction: React.FC = () => {
    // Import custom hooks for clipboard copy state and handler function
    const { isTxModalOpen, txHash, isTxError, txMessage, txConfirmed, copied, handleCopyToClipboard } = useModalTransaction();

    return (
        // Render the modal with various transaction details
        <article className={styles.container}>
            <div className={styles.layout}>
                {/* Modal title */}
                <h2 className={styles.title}>Transaction Status</h2>

                {/* Display transaction message in a read-only textarea */}
                {!isNullOrBlank(txMessage) && <textarea value={txMessage} readOnly className={styles.textarea}></textarea>}

                {/* Section displaying the transaction hash with copy functionality */}
                <div className={styles.transDiv}>
                    <span className={styles.transText}>Tx Hash:</span>
                    <div
                        className={`${styles.txHashContainer} ${copied ? (txHash ? styles.copied : styles.copiedError) : ''}`}
                        onClick={() => handleCopyToClipboard(txHash)} // Copy to clipboard on click
                        style={{ cursor: 'pointer' }}
                    >
                        {txHash}

                        {/* Conditional rendering of clipboard icons based on copy state and transaction hash */}
                        {!copied ? (
                            // Icon for copying to clipboard
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard2 inline" viewBox="0 0 16 16">
                                <path d="M3.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-12a.5.5 0 0 0-.5-.5H12a.5.5 0 0 1 0-1h.5A1.5 1.5 0 0 1 14 2.5v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-12A1.5 1.5 0 0 1 3.5 1H4a.5.5 0 0 1 0 1z" />
                                <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5" />
                            </svg>
                        ) : txHash ? (
                            // Icon indicating copy success
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard2-check-fill inline" viewBox="0 0 16 16">
                                <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585q.084.236.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5q.001-.264.085-.5m6.769 6.854-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                            </svg>
                        ) : (
                            // Icon indicating copy failure
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline bi bi-clipboard2-x" viewBox="0 0 16 16">
                                <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z" />
                                <path d="M8 8.293 6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Display transaction status: Confirmed, Error, or Waiting */}
                <div className={styles.transDiv}>
                    <span className={styles.transText}>Status:</span>
                    <div className={`${styles.status} ${txConfirmed ? styles.confirmed : isTxError ? styles.error : styles.waiting}`}>
                        {txConfirmed ? 'Confirmed' : isTxError ? 'Error' : 'Waiting...'}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ModalTransaction;
