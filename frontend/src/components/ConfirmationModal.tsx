'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-error hover:bg-error/80',
    warning: 'bg-warning hover:bg-warning/80',
    info: 'bg-primary hover:bg-primary-hover'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border-color rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-warning">warning</span>
          <div>
            <h3 className="font-display text-xl text-text-dark mb-2">{title}</h3>
            <p className="text-text-muted">{message}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-black/20 text-text-light border border-border-color rounded-lg hover:bg-white/10 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-white rounded-lg transition-colors ${variantStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}