import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ 
  selectedCount = 0, 
  onBulkAction, 
  onClearSelection 
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const bulkActionOptions = [
    { value: '', label: 'Choose action...' },
    { value: 'markPaid', label: 'Mark as Paid' },
    { value: 'markPending', label: 'Mark as Pending' },
    { value: 'sendReminder', label: 'Send Reminders' },
    { value: 'downloadPdf', label: 'Download PDFs' },
    { value: 'export', label: 'Export to CSV' },
    { value: 'delete', label: 'Delete Invoices' }
  ];

  const getActionConfig = (action) => {
    switch (action) {
      case 'markPaid':
        return {
          title: 'Mark Invoices as Paid',
          message: `Are you sure you want to mark ${selectedCount} invoice(s) as paid? This action cannot be undone.`,
          confirmText: 'Mark as Paid',
          variant: 'success'
        };
      case 'markPending':
        return {
          title: 'Mark Invoices as Pending',
          message: `Are you sure you want to mark ${selectedCount} invoice(s) as pending?`,
          confirmText: 'Mark as Pending',
          variant: 'default'
        };
      case 'sendReminder':
        return {
          title: 'Send Payment Reminders',
          message: `Are you sure you want to send payment reminders for ${selectedCount} invoice(s)?`,
          confirmText: 'Send Reminders',
          variant: 'default'
        };
      case 'downloadPdf':
        return {
          title: 'Download PDF Files',
          message: `This will download PDF files for ${selectedCount} invoice(s).`,
          confirmText: 'Download PDFs',
          variant: 'default'
        };
      case 'export':
        return {
          title: 'Export to CSV',
          message: `This will export ${selectedCount} invoice(s) to a CSV file.`,
          confirmText: 'Export CSV',
          variant: 'default'
        };
      case 'delete':
        return {
          title: 'Delete Invoices',
          message: `Are you sure you want to delete ${selectedCount} invoice(s)? This action cannot be undone.`,
          confirmText: 'Delete Invoices',
          variant: 'destructive'
        };
      default:
        return null;
    }
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    if (action && action !== '') {
      const config = getActionConfig(action);
      if (config) {
        setPendingAction({ action, config });
        setIsConfirmOpen(true);
      }
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      onBulkAction(pendingAction?.action);
      setIsConfirmOpen(false);
      setPendingAction(null);
      setSelectedAction('');
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setPendingAction(null);
    setSelectedAction('');
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {selectedCount} invoice{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="w-64">
            <Select
              options={bulkActionOptions}
              value={selectedAction}
              onChange={handleActionSelect}
              placeholder="Choose bulk action..."
            />
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
        >
          Clear Selection
        </Button>
      </div>
      {/* Confirmation Modal */}
      {isConfirmOpen && pendingAction && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 modal-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${pendingAction?.config?.variant === 'destructive' ? 'bg-error/10' : 
                  pendingAction?.config?.variant === 'success' ? 'bg-success/10' : 'bg-primary/10'}
              `}>
                <Icon 
                  name={
                    pendingAction?.config?.variant === 'destructive' ? 'AlertTriangle' :
                    pendingAction?.config?.variant === 'success' ? 'CheckCircle' : 'Info'
                  }
                  size={20}
                  className={
                    pendingAction?.config?.variant === 'destructive' ? 'text-error' :
                    pendingAction?.config?.variant === 'success' ? 'text-success' : 'text-primary'
                  }
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {pendingAction?.config?.title}
              </h3>
            </div>

            <p className="text-muted-foreground mb-6">
              {pendingAction?.config?.message}
            </p>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction?.config?.variant}
                onClick={handleConfirm}
              >
                {pendingAction?.config?.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;