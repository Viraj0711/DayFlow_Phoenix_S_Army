import React from 'react';
import '../styles/card.css';

export const Card = ({ children, className = '', interactive = false, onClick }) => {
  const cardClasses = [
    'card',
    interactive && 'card-interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`card-title ${className}`}>
      {children}
    </h3>
  );
};

export const CardSubtitle = ({ children, className = '' }) => {
  return (
    <p className={`card-subtitle ${className}`}>
      {children}
    </p>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
};

export const StatCard = ({ label, value, change, variant = 'primary', className = '' }) => {
  const statClasses = [
    'stat-card',
    variant !== 'primary' && variant,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={statClasses}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
};

export default Card;
