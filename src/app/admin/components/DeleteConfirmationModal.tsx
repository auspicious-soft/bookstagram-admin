import React from 'react';
import Image from 'next/image';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete?',
  message = 'Are you sure you really want to delete this?',
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 grid place-items-center">
      <div className="bg-white rounded-[20px] p-6 w-[400px] max-w-[90%] shadow-xl text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/assets/images/Delete.svg"
            alt="Delete confirmation"
            width={200}
            height={150}
            priority
          />
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-darkBlack">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            className="px-8 py-3 rounded-[28px] border border-darkBlack text-sm w-full"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="px-8 py-3 rounded-[28px] bg-orange text-white text-sm w-full flex items-center justify-center gap-2"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
