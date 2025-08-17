import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientCard = ({ client, onCreateInvoice, onViewHistory, onEditClient, onContactClient }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/client-profile', { state: { clientId: client?.id } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-success bg-success/10';
      case 'good':
        return 'text-primary bg-primary/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'poor':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 card-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 
              className="text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={handleViewProfile}
            >
              {client?.name}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client?.paymentStatus)}`}>
              {client?.paymentStatus}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">{client?.company}</p>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={onContactClient}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Contact Client"
          >
            <Icon name="Mail" size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={onEditClient}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Edit Client"
          >
            <Icon name="Edit" size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Mail" size={14} />
          <span className="truncate">{client?.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Phone" size={14} />
          <span>{client?.phone}</span>
        </div>
        {client?.address && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span className="truncate">{client?.address}</span>
          </div>
        )}
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{client?.totalInvoices}</div>
          <div className="text-xs text-muted-foreground">Invoices</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(client?.outstandingBalance)}
          </div>
          <div className="text-xs text-muted-foreground">Outstanding</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(client?.totalRevenue)}
          </div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
      </div>
      {/* Last Activity */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Last Invoice:</span>
        <span>{client?.lastInvoiceDate ? formatDate(client?.lastInvoiceDate) : 'Never'}</span>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          onClick={onCreateInvoice}
          className="flex-1"
        >
          New Invoice
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="FileText"
          iconPosition="left"
          onClick={onViewHistory}
          className="flex-1"
        >
          History
        </Button>
      </div>
      {/* Tags */}
      {client?.tags && client?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {client?.tags?.slice(0, 3)?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-secondary/20 text-secondary-foreground rounded-md"
            >
              {tag}
            </span>
          ))}
          {client?.tags?.length > 3 && (
            <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
              +{client?.tags?.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientCard;