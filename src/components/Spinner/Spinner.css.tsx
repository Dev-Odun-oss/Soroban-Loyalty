// CSS-only spinner for environments where SVG might be blocked
export const cssSpinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-css {
  display: inline-block;
  border-style: solid;
  border-color: currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-css-sm {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

.spinner-css-md {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
}

.spinner-css-lg {
  width: 3rem;
  height: 3rem;
  border-width: 4px;
}
`;

export const CSSSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`spinner-css spinner-css-${size} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
