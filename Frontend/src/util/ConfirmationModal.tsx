import React, { useState } from 'react';
import { Modal, Button } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleConfirm = () => {
        setIsOpen(false);
        onConfirm();
    };

    const handleCancel = () => {
        setIsOpen(false);
        onCancel();
    };

    return (
        <Modal size={'md'} show={isOpen} onClose={handleCancel}>
            {/* <Modal.Header>Confirmation</Modal.Header> */}
            <Modal.Body>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {message}
                    </h3>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-center gap-4 w-full">
                    <Button color={'purple'} onClick={handleConfirm}>Yes</Button>
                    <Button color="gray" onClick={handleCancel}>
                        No
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;