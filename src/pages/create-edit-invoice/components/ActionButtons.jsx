import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ActionButtons = ({
  onSaveDraft,
  onSaveAndSend,
  onSaveAndDownload,
  onCancel,
  isEditing = false,
  isSaving = false,
  hasUnsavedChanges = false
}) => {
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  const handleSaveDraft = () => {
    onSaveDraft();
    setShowSaveOptions(false);
  };

  const handleSaveAndSend = () => {
    onSaveAndSend();
    setShowSaveOptions(false);
  };

  const handleSaveAndDownload = () => {
    onSaveAndDownload();
    setShowSaveOptions(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-3">
        {/* Left side - Status indicator */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {hasUnsavedChanges && (
            <>
              <Icon name="AlertCircle" size={16} className="text-warning" />
              <span>You have unsaved changes</span>
            </>
          )}
          {isSaving && (
            <>
              <Icon name="Loader2" size={16} className="animate-spin text-primary" />
              <span>Saving...</span>
            </>
          )}
          {!hasUnsavedChanges && !isSaving && (
            <>
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>All changes saved</span>
            </>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>

          {/* Desktop: Separate buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Save"
              iconPosition="left"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              Save Draft
            </Button>

            <Button
              variant="secondary"
              iconName="Download"
              iconPosition="left"
              onClick={handleSaveAndDownload}
              disabled={isSaving}
            >
              Save & Download
            </Button>

            <Button
              variant="default"
              iconName="Send"
              iconPosition="left"
              onClick={handleSaveAndSend}
              disabled={isSaving}
              loading={isSaving}
            >
              {isEditing ? 'Update & Send' : 'Save & Send'}
            </Button>
          </div>

          {/* Mobile: Dropdown menu */}
          <div className="sm:hidden relative">
            <Button
              variant="default"
              iconName="ChevronDown"
              iconPosition="right"
              onClick={() => setShowSaveOptions(!showSaveOptions)}
              disabled={isSaving}
            >
              Save Options
            </Button>

            {showSaveOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg modal-shadow z-50">
                <div className="py-2">
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                    disabled={isSaving}
                  >
                    <Icon name="Save" size={16} />
                    <span>Save Draft</span>
                  </button>
                  
                  <button
                    onClick={handleSaveAndDownload}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                    disabled={isSaving}
                  >
                    <Icon name="Download" size={16} />
                    <span>Save & Download</span>
                  </button>
                  
                  <button
                    onClick={handleSaveAndSend}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                    disabled={isSaving}
                  >
                    <Icon name="Send" size={16} />
                    <span>{isEditing ? 'Update & Send' : 'Save & Send'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Backdrop for mobile dropdown */}
            {showSaveOptions && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSaveOptions(false)}
              />
            )}
          </div>
        </div>
      </div>
      {/* Auto-save indicator */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={12} />
            <span>Auto-save enabled</span>
          </div>
          <span>Last saved: {new Date()?.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;