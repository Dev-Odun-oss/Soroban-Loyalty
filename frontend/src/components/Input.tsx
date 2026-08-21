import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function Input({ id, label, error, className, ...props }: InputProps) {
  const errorId = error ? `${id}-err` : undefined;
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`form-input${error ? " form-input--error" : ""}${className ? ` ${className}` : ""}`}
        {...props}
      />
      {error && (
        <span id={errorId} className="form-field-error" role="alert">
          <svg
            aria-hidden="true"
            focusable="false"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 3.5v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 1.5 0zM8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
