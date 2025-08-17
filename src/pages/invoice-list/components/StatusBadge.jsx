import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusBadge = ({ status, size = 'default' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          icon: 'CheckCircle',
          className: 'bg-success/10 text-success border-success/20'
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: 'Clock',
          className: 'bg-warning/10 text-warning border-warning/20'
        };
      case 'overdue':
        return {
          label: 'Overdue',
          icon: 'AlertCircle',
          className: 'bg-error/10 text-error border-error/20'
        };
      case 'draft':
        return {
          label: 'Draft',
          icon: 'Edit',
          className: 'bg-muted text-muted-foreground border-border'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: 'XCircle',
          className: 'bg-muted text-muted-foreground border-border'
        };
      case 'partial':
        return {
          label: 'Partial',
          icon: 'DollarSign',
          className: 'bg-accent/10 text-accent border-accent/20'
        };
      default:
        return {
          label: 'Unknown',
          icon: 'HelpCircle',
          className: 'bg-muted text-muted-foreground border-border'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <div className={`
      inline-flex items-center space-x-1.5 rounded-full border font-medium transition-smooth
      ${config?.className} ${sizeClasses}
    `}>
      <Icon name={config?.icon} size={iconSize} />
      <span>{config?.label}</span>
    </div>
  );
};

export default StatusBadge;