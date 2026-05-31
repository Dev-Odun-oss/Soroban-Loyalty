import React from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { useToast } from './components/Toast';

// Example component showing how to use toasts
const ExampleComponent: React.FC = () => {
  const toast = useToast();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Toast Notification Demo</h1>
      
      <div className="space-x-2">
        <button
          onClick={() => toast.success('Operation completed successfully!')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Success Toast
        </button>
        
        <button
          onClick={() => toast.error('Something went wrong!')}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Error Toast
        </button>
        
        <button
          onClick={() => toast.warning('Please review your input')}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Warning Toast
        </button>
        
        <button
          onClick={() => toast.info('New update available')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Info Toast
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <ExampleComponent />
    </ToastProvider>
  );
}

export default App;
