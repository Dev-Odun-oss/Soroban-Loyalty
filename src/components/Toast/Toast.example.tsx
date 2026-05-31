import React from 'react';
import { useToast } from '../../contexts/ToastContext';

export const ToastExample: React.FC = () => {
  const toast = useToast();

  const showSuccessToast = () => {
    toast.success('Payment processed successfully!', 4000);
  };

  const showErrorToast = () => {
    toast.error('Transaction failed. Please try again.', 4000);
  };

  const showWarningToast = () => {
    toast.warning('Your session will expire in 5 minutes.', 4000);
  };

  const showInfoToast = () => {
    toast.info('New loyalty rewards available!', 4000);
  };

  const showMultipleToasts = () => {
    toast.info('First toast');
    setTimeout(() => toast.success('Second toast - stacking works!'), 200);
    setTimeout(() => toast.warning('Third toast - auto-dismiss after 4s'), 400);
  };

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-xl font-semibold">Toast Notification Examples</h2>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={showSuccessToast}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Success Toast
        </button>
        
        <button
          onClick={showErrorToast}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Error Toast
        </button>
        
        <button
          onClick={showWarningToast}
          className="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
        >
          Warning Toast
        </button>
        
        <button
          onClick={showInfoToast}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Info Toast
        </button>
        
        <button
          onClick={showMultipleToasts}
          className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          Stack Multiple Toasts
        </button>
      </div>
    </div>
  );
};
