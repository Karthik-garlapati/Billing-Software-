import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OverviewTab = ({ client, isEditing, onClientUpdate }) => {
  const [editedClient, setEditedClient] = useState(client);

  const handleInputChange = (field, value) => {
    const updatedClient = { ...editedClient, [field]: value };
    setEditedClient(updatedClient);
    onClientUpdate(updatedClient);
  };

  const paymentTermsOptions = [
    { value: 'net15', label: 'Net 15' },
    { value: 'net30', label: 'Net 30' },
    { value: 'net45', label: 'Net 45' },
    { value: 'net60', label: 'Net 60' },
    { value: 'due_on_receipt', label: 'Due on Receipt' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Contact Information */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="User" size={20} className="text-primary" />
            <span>Contact Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-muted-foreground">{client?.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contact Person</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient?.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-muted-foreground">{client?.contactPerson}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedClient?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-muted-foreground">{client?.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedClient?.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-muted-foreground">{client?.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="MapPin" size={20} className="text-primary" />
            <span>Billing Address</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedClient?.address?.street}
                  onChange={(e) => handleInputChange('address', { ...editedClient?.address, street: e?.target?.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-muted-foreground">{client?.address?.street}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedClient?.address?.city}
                    onChange={(e) => handleInputChange('address', { ...editedClient?.address, city: e?.target?.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{client?.address?.city}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedClient?.address?.state}
                    onChange={(e) => handleInputChange('address', { ...editedClient?.address, state: e?.target?.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{client?.address?.state}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedClient?.address?.zipCode}
                    onChange={(e) => handleInputChange('address', { ...editedClient?.address, zipCode: e?.target?.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-muted-foreground">{client?.address?.zipCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="CreditCard" size={20} className="text-primary" />
            <span>Payment Terms</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Default Payment Terms</label>
              {isEditing ? (
                <select
                  value={editedClient?.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e?.target?.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {paymentTermsOptions?.map(option => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-muted-foreground">
                  {paymentTermsOptions?.find(opt => opt?.value === client?.paymentTerms)?.label}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tax Rate (%)</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editedClient?.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e?.target?.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="text-muted-foreground">{client?.taxRate}%</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions & Notes */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="Zap" size={20} className="text-primary" />
            <span>Quick Actions</span>
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="default"
              fullWidth
              iconName="Plus"
              iconPosition="left"
              onClick={() => window.location.href = `/create-edit-invoice?client=${client?.id}`}
            >
              Create Invoice
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              iconName="DollarSign"
              iconPosition="left"
            >
              Record Payment
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              iconName="Mail"
              iconPosition="left"
            >
              Send Email
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              iconName="Download"
              iconPosition="left"
            >
              Export Statement
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="FileText" size={20} className="text-primary" />
            <span>Notes</span>
          </h3>
          
          {isEditing ? (
            <textarea
              value={editedClient?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Add notes about this client..."
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              {client?.notes || 'No notes added yet.'}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="Tag" size={20} className="text-primary" />
            <span>Tags</span>
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {client?.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
              >
                {tag}
              </span>
            ))}
            {isEditing && (
              <button className="px-2 py-1 text-xs border border-dashed border-border rounded-full text-muted-foreground hover:border-primary hover:text-primary transition-smooth">
                + Add Tag
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;