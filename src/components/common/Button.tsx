import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
}) => {
  const baseStyles = 'font-sans inline-flex items-center justify-center transition-all duration-300 ease-in-out';
  
  const variantStyles = {
    primary: 'bg-charcoal text-ivory hover:bg-gray-800 border border-transparent',
    secondary: 'bg-gold text-charcoal hover:bg-gold-light border border-transparent',
    outline: 'bg-transparent text-charcoal hover:bg-gray-100 border border-charcoal',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-base px-8 py-4',
  };
  
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button 
      className={styles}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;