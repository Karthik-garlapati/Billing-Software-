import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ClientSelectionSection = ({ 
  selectedClient, 
  onClientChange, 
  onAddNewClient 
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const clientOptions = [
    {
      value: "client-1",
      label: "Acme Corporation",
      description: "acme@corporation.com"
    },
    {
      value: "client-2",
      label: "Tech Solutions Inc.",
      description: "contact@techsolutions.com"
    },
    {
      value: "client-3",
      label: "Global Enterprises",
      description: "info@globalenterprises.com"
    },
    {
      value: "client-4",
      label: "Startup Ventures",
      description: "hello@startupventures.com"
    },
    {
      value: "client-5",
      label: "Creative Agency",
      description: "team@creativeagency.com"
    }
  ];

  const handleAddNewClient = () => {
    setIsAddingNew(true);
    onAddNewClient();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Client Information</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          iconName="UserPlus"
          iconPosition="left"
          onClick={handleAddNewClient}
        >
          Add New Client
        </Button>
      </div>
      <div className="space-y-4">
        <Select
          label="Select Client"
          placeholder="Choose a client or add new"
          options={clientOptions}
          value={selectedClient}
          onChange={onClientChange}
          searchable
          required
          description="Search by company name or email address"
        />

        {selectedClient && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">
                  {clientOptions?.find(c => c?.value === selectedClient)?.label}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {clientOptions?.find(c => c?.value === selectedClient)?.description}
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>123 Client Street, Business City, BC 12345</p>
                  <p>Phone: +1 (555) 987-6543</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                iconName="Edit"
                onClick={() => console.log('Edit client')}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSelectionSection;