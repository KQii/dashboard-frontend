import { AlertTriangle } from "lucide-react";
import { Modal } from "../common/Modal";

interface ConfirmDeleteProps {
  isOpen: boolean;
  resourceName: string;
  onConfirm: () => void;
  onCloseModal: () => void;
  disabled?: boolean;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDelete({
  isOpen,
  resourceName,
  onConfirm,
  onCloseModal,
  disabled = false,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmDeleteProps) {
  const handleConfirm = () => {
    onConfirm();
    onCloseModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      title="Confirm Deletion"
      size="sm"
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-gray-900 font-medium">
            {message || `Are you sure you want to delete "${resourceName}"?`}
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCloseModal}
            disabled={disabled}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={disabled}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
