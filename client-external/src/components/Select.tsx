import type { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = ({
  label,
  error,
  icon,
  options = [],
  className = '',
  ...props
}: SelectProps) => {
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {icon}
          </div>
        )}
        <select
          {...props}
          className={`
            w-full px-4 py-3 border-2 rounded-xl appearance-none
            ${icon ? 'pl-12' : ''}
            border-outline-variant text-on-surface bg-surface
            focus:outline-none focus:border-primary
            disabled:bg-surface-variant disabled:text-on-surface-variant
            ${error ? 'border-error' : ''}
            ${className}
          `}
        >
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
          expand_more
        </span>
      </div>
      {error && <p className="text-label-sm text-error mt-1">{error}</p>}
    </div>
  );
};
