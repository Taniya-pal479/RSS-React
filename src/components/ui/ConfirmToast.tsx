import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmToastProps {
  onConfirm: () => void;
  message: string;
  closeToast?: () => void;
}

const ConfirmToast = ({ onConfirm, message, closeToast }: ConfirmToastProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="p-1">
      <p className="text-sm font-bold text-gray-800 mb-3">{message}</p>
      <div className="flex gap-2 justify-end">
        <button 
          onClick={closeToast} 
          className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {t('cancel_btn')}
        </button>
        <button 
          onClick={() => { onConfirm(); closeToast?.(); }} 
          className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm transition-colors"
        >
          {t('delete_btn')}
        </button>
      </div>
    </div>
  );
};

export default ConfirmToast;