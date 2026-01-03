import React from 'react';
import '../styles/button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    icon && 'btn-icon',
    icon && size !== 'md' && `btn-icon-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
