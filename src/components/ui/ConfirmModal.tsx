import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Modal } from "../common/Modal";

interface ConfirmDeleteProps {
  isOpen: boolean;
  variant?: "danger" | "warning" | "success" | "info" | "neutral";
  title?: string;
  resourceName: string;
  onConfirm: () => void;
  onCloseModal: () => void;
  disabled?: boolean;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const variantConfig = {
  danger: {
    bg: "bg-red-100",
    iconColor: "text-red-600",
    button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    Icon: AlertTriangle,
  },
  warning: {
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    button: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400",
    Icon: AlertTriangle,
  },
  success: {
    bg: "bg-green-100",
    iconColor: "text-green-600",
    button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    Icon: CheckCircle2,
  },
  info: {
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    Icon: Info,
  },
  neutral: {
    bg: "bg-gray-200",
    iconColor: "text-gray-600",
    button: "bg-gray-700 hover:bg-gray-800 focus:ring-gray-500",
    Icon: Info,
  },
};

export function ConfirmModal({
  isOpen,
  variant = "danger",
  title = "Confirm Deletion",
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

  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal} title={title} size="sm">
      <div className="space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={`flex items-center justify-center w-12 h-12 ${config.bg} rounded-full`}
          >
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-gray-900 font-medium">
            {message ||
              (resourceName
                ? `Are you sure you want to proceed with "${resourceName}"?`
                : `Are you sure you want to proceed?`)}
          </p>
          {variant === "danger" && (
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          )}
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
            className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${config.button} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
