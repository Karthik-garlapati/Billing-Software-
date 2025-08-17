import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkActions = ({ 
  selectedClients, 
  onSelectAll, 
  onDeselectAll, 
  onBulkEmail, 
  onBulkExport, 
  onBulkDelete,
  totalClients 
}) => {
  const [showActions, setShowActions] = useState(false);

  const isAllSelected = selectedClients?.length === totalClients && totalClients > 0;
  const isPartiallySelected = selectedClients?.length > 0 && selectedClients?.length < totalClients;

  const handleSelectAllChange = (checked) => {
    if (checked) {
      onSelectAll();
    } else {
      onDeselectAll();
    }
  };

  const handleBulkAction = (action) => {
    action();
    setShowActions(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* Selection Controls */}
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            onChange={(e) => handleSelectAllChange(e?.target?.checked)}
            label={
              selectedClients?.length > 0 
                ? `${selectedClients?.length} client${selectedClients?.length !== 1 ? 's' : ''} selected`
                : 'Select all clients'
            }
          />
        </div>

        {/* Bulk Actions */}
        {selectedClients?.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="MoreHorizontal"
                onClick={() => setShowActions(!showActions)}
              >
                Actions
              </Button>

              {showActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg modal-shadow z-[100]">
                  <div className="py-2">
                    <button
                      onClick={() => handleBulkAction(onBulkEmail)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name="Mail" size={16} />
                      <span>Send Email Campaign</span>
                    </button>
                    
                    <button
                      onClick={() => handleBulkAction(onBulkExport)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name="Download" size={16} />
                      <span>Export to CSV</span>
                    </button>
                    
                    <div className="border-t border-border my-1"></div>
                    
                    <button
                      onClick={() => handleBulkAction(onBulkDelete)}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                    >
                      <Icon name="Trash2" size={16} />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              iconName="X"
              onClick={onDeselectAll}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
      {/* Overlay for dropdown */}
      {showActions && (
        <div
          className="fixed inset-0 z-[50]"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default BulkActions;