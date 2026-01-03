import React from 'react';
import '../styles/components.css';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const badgeClasses = [
    'badge',
    `badge-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export const Alert = ({ children, variant = 'info', title, icon, className = '' }) => {
  const alertClasses = [
    'alert',
    `alert-${variant}`,
    className
  ].filter(Boolean).join(' ');

  const defaultIcons = {
    success: '✓',
    warning: '⚠',
    error: '×',
    info: 'ℹ'
  };

  return (
    <div className={alertClasses} role="alert">
      {icon !== false && (
        <div className="alert-icon">
          {icon || defaultIcons[variant]}
        </div>
      )}
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
    </div>
  );
};

export default { Badge, Alert };
