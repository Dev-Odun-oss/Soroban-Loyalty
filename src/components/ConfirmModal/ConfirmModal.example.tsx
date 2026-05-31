import React, { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

// Example usage component
export const ConfirmModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleConfirm = () => {
    setResult('Action confirmed!');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setResult('Action cancelled');
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Delete Item
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isDestructive={true}
      />

      {result && (
        <div className="mt-4 rounded-md bg-gray-100 p-4">
          <p className="text-gray-700">{result}</p>
        </div>
      )}
    </div>
  );
};
