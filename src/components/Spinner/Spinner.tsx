import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'current' | 'primary' | 'white' | 'gray';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const colorClasses: Record<SpinnerColor, string> = {
  current: 'text-current',
  primary: 'text-blue-600',
  white: 'text-white',
  gray: 'text-gray-400',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'current',
  className = '',
  label = 'Loading',
}) => {
  return (
    <div
      role="status"
      className={`inline-flex items-center justify-center ${className}`}
      aria-label={label}
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
