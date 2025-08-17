import React from 'react';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCount, onClearSelection, onBulkDelete }) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="destructive"
            size="sm"
            iconName="Trash2"
            iconPosition="left"
            onClick={onBulkDelete}
          >
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
