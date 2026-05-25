import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated';
}

export const Card = ({
  children,
  className = '',
  onClick,
  variant = 'default',
}: CardProps) => {
  const variantClasses = {
    default: 'bg-surface border-2 border-surface-variant',
    elevated: 'bg-surface-container-low shadow-md',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl p-6
        ${variantClasses[variant]}
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
}

export const Avatar = ({ src, alt, size = 'md', initials }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : initials ? (
        <span className="text-body-md font-hanken font-600 text-on-primary-container">
          {initials}
        </span>
      ) : (
        <span className="material-symbols-outlined text-on-primary-fixed">person</span>
      )}
    </div>
  );
};

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md';
}

export const Badge = ({ children, variant = 'primary', size = 'md' }: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-primary-fixed text-on-primary-fixed',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed',
    success: 'bg-primary-fixed text-on-primary-fixed',
    error: 'bg-error-container text-on-error-container',
    warning: 'bg-tertiary-container text-on-tertiary-container',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-label-sm',
    md: 'px-4 py-2 text-label-md',
  };

  return (
    <span className={`rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};
