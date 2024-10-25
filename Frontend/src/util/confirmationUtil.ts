import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmationModal from './ConfirmationModal';

// use it like: const confirmed = await showConfirmationModal("Are you sure you want to delete this item?");

const showConfirmationModal = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const modalRoot = document.createElement('div');
        document.body.appendChild(modalRoot);
        const root = createRoot(modalRoot);

        const handleConfirm = () => {
            root.unmount();
            document.body.removeChild(modalRoot);
            resolve(true);
        };

        const handleCancel = () => {
            root.unmount();
            document.body.removeChild(modalRoot);
            resolve(false);
        };

        root.render(
            React.createElement(ConfirmationModal, {
                message: message,
                onConfirm: handleConfirm,
                onCancel: handleCancel
            })
        );
    });
};

export default showConfirmationModal;