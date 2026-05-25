import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helpText?: string;
}

export const Input = ({
  label,
  error,
  icon,
  helpText,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-label-md text-on-surface mb-2">
          {label}
          {props.required && <span className="text-error"> *</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full px-4 py-3 border-2 rounded-xl
            ${icon ? 'pl-12' : ''}
            border-outline-variant text-on-surface
            placeholder:text-on-surface-variant
            focus:outline-none focus:border-primary
            disabled:bg-surface-variant disabled:text-on-surface-variant
            ${error ? 'border-error' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-label-sm text-error mt-1">{error}</p>}
      {helpText && <p className="text-label-sm text-on-surface-variant mt-1">{helpText}</p>}
    </div>
  );
};
