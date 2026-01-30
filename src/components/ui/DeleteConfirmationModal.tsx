import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'category' | 'subcategory';
  isLoading?: boolean;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, type, isLoading }: DeleteModalProps) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        
        {/* Warning Icon Area */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-20"></div>
          <AlertCircle size={32} className="text-red-500 relative z-10" />
        </div>

        {/* Dynamic Title and Description */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {type === 'category' ? t('delete_category_title') : t('delete_subcategory_title')}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
          {t('delete_confirm_msg')}
        </p>

        {/* Modal Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-200 disabled:opacity-70"
          >
            {isLoading ? t('deleting') : t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;