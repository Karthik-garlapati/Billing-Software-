import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientHeader = ({ client, onEdit, onSave, onCancel, isEditing }) => {
  const navigate = useNavigate();
  const [editedClient, setEditedClient] = useState(client);

  const handleInputChange = (field, value) => {
    setEditedClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedClient);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border';
      case 'overdue':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/client-list')}
            className="p-2 hover:bg-muted rounded-lg transition-smooth"
          >
            <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={24} className="text-primary" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  className="text-2xl font-bold text-foreground bg-transparent border-b border-border focus:border-primary outline-none"
                />
              ) : (
                <h1 className="text-2xl font-bold text-foreground">{client?.name}</h1>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client?.status)}`}>
                  {client?.status?.charAt(0)?.toUpperCase() + client?.status?.slice(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Client since {new Date(client.createdAt)?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={onEdit}
              >
                Edit Client
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={() => navigate(`/create-edit-invoice?client=${client?.id}`)}
              >
                New Invoice
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${client?.totalInvoiced?.toLocaleString()}</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Amount Paid</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${client?.amountPaid?.toLocaleString()}</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Clock" size={16} className="text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${client?.outstanding?.toLocaleString()}</p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Avg Payment Time</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{client?.avgPaymentTime} days</p>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;