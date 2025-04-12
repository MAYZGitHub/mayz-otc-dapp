import { useState } from 'react';
import { useAppStore } from 'smart-db';

// Custom hook for managing modal transaction state and clipboard functionality
export function useModalTask() {
    const appStore = useAppStore();

    // State for tracking if text was successfully copied
    const [copied, setCopied] = useState(false);

    // Function to handle copying text to clipboard
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text || '') // Writes text to clipboard (defaults to empty string if text is falsy)
            .then(() => {
                setCopied(true); // Sets `copied` to true upon successful copy
                setTimeout(() => setCopied(false), 1000); // Resets `copied` to false after 1 second
            })
            .catch((err) => {
                console.error('Error copying text:', err); // Logs error if copying fails
            });
    };

    // Return the modal and clipboard states and their handlers
    return {
        isModalOpen: appStore.showProcessingTx,
        txHash: appStore.processingTxHash,
        isTxError: appStore.isFaildedTx,
        txMessage: appStore.processingTxMessage,
        txConfirmed: appStore.isConfirmedTx,
        copied,
        handleCopyToClipboard,
    };
}
