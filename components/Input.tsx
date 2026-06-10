import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-neutral-400 mb-2 uppercase tracking-widest font-mono">
          {label}
          {props.required && <span className="text-error-400"> *</span>}
        </label>
      )}
      <input
        className={`
          input-base
          ${error ? 'border-error-400 focus:ring-error-400/30' : ''}
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-error-400 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-neutral-100 mt-1">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-neutral-400 mb-2 uppercase tracking-widest font-mono">
          {label}
          {props.required && <span className="text-error-400"> *</span>}
        </label>
      )}
      <textarea
        className={`
          input-base
          resize-none
          ${error ? 'border-error-400 focus:ring-error-400/30' : ''}
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-error-400 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-neutral-100 mt-1">{helperText}</p>
      )}
    </div>
  );
}

export default Input;
