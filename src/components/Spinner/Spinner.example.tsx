import React, { useState } from 'react';
import { Spinner, LoadingButton, PageLoader } from './';

export const SpinnerExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const simulateAsyncAction = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const simulatePageLoad = async () => {
    setIsPageLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPageLoading(false);
  };

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold">Spinner Sizes</h2>
        <div className="flex items-end gap-8">
          <div className="text-center">
            <Spinner size="sm" />
            <p className="mt-2 text-sm text-gray-500">Small (sm)</p>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <p className="mt-2 text-sm text-gray-500">Medium (md)</p>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-2 text-sm text-gray-500">Large (lg)</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Spinner Colors</h2>
        <div className="flex gap-8">
          <div className="text-center">
            <Spinner color="current" />
            <p className="mt-2 text-sm text-gray-500">Current</p>
          </div>
          <div className="text-center">
            <Spinner color="primary" />
            <p className="mt-2 text-sm text-gray-500">Primary</p>
          </div>
          <div className="text-center">
            <div className="rounded-md bg-gray-800 p-2">
              <Spinner color="white" />
            </div>
            <p className="mt-2 text-sm text-gray-500">White</p>
          </div>
          <div className="text-center">
            <Spinner color="gray" />
            <p className="mt-2 text-sm text-gray-500">Gray</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Loading Button</h2>
        <div className="flex gap-4">
          <LoadingButton onClick={simulateAsyncAction} loading={isLoading}>
            Click to Simulate
          </LoadingButton>
          
          <LoadingButton
            variant="secondary"
            size="sm"
            onClick={simulateAsyncAction}
            loading={isLoading}
          >
            Small Button
          </LoadingButton>
          
          <LoadingButton
            variant="danger"
            size="lg"
            onClick={simulateAsyncAction}
            loading={isLoading}
          >
            Large Danger
          </LoadingButton>
        </div>
        {isLoading && <p className="mt-2 text-sm text-blue-600">Action in progress...</p>}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Page Loader</h2>
        <LoadingButton onClick={simulatePageLoad} loading={isPageLoading} variant="secondary">
          Simulate Page Load
        </LoadingButton>
        
        <PageLoader isLoading={isPageLoading} fullScreen={isPageLoading}>
          <div className="mt-4 rounded-lg border p-4">
            <p>This content will be blurred when loading.</p>
            <p className="text-sm text-gray-500">Click the button above to see the page loader overlay.</p>
          </div>
        </PageLoader>
      </section>

      <section className="border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold">Usage Examples</h2>
        <pre className="rounded-lg bg-gray-900 p-4 text-sm text-gray-300 overflow-x-auto">
{`// Button with loading state
<LoadingButton loading={isLoading} onClick={handleAction}>
  Submit
</LoadingButton>

// Standalone spinner
<Spinner size="md" color="primary" />

// Page loader overlay
<PageLoader isLoading={isLoading} fullScreen>
  <YourApp />
</PageLoader>

// Inline spinner
{isLoading && <Spinner size="sm" />}
`}
        </pre>
      </section>
    </div>
  );
};

export default SpinnerExample;
