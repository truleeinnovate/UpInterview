import React from 'react';
import { Badge } from './ui/badge';

function StatusBadge({ status, size = 'md', className = '' }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'In Progress':
      case 'Scheduled':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      case 'Rejected':
        return 'purple';
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getSizeMapping = (size) => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      case 'md':
      default:
        return 'default';
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(status)} 
      size={getSizeMapping(size)}
      className={className}
    >
      {status}
    </Badge>
  );
}

export default StatusBadge;