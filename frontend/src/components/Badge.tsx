import React from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  status?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', status }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const className = status ? getStatusColor(status) : variantClasses[variant];

  return <span className={cn('badge', className)}>{children}</span>;
};

export default Badge;
