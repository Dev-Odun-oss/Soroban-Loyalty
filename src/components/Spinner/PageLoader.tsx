import React from 'react';
import { Spinner } from './Spinner';

interface PageLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  isLoading,
  children,
  fullScreen = false,
}) => {
  if (!isLoading) return <>{children}</>;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <Spinner size="lg" color="primary" label="Loading page content" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[200px]">
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
        <Spinner size="md" color="primary" />
      </div>
      <div className="opacity-50 pointer-events-none">{children}</div>
    </div>
  );
};

export default PageLoader;
