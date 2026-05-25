import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) => {
  const baseClasses = 'font-label-md transition-all rounded-full border-0 cursor-pointer flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container disabled:bg-surface-variant disabled:text-on-surface',
    secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary disabled:bg-surface-variant',
    tertiary: 'bg-transparent text-primary hover:bg-surface-variant',
  };

  const sizeClasses = {
    sm: 'px-6 py-2 text-label-sm',
    md: 'px-8 py-3 text-label-md',
    lg: 'px-10 py-4 text-body-md',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};
