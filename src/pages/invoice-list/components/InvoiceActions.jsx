import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InvoiceActions = ({ 
  invoice, 
  onAction, 
  isVisible = true, 
  isMobile = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const actions = [
    {
      label: 'View Details',
      icon: 'Eye',
      action: 'view',
      variant: 'ghost'
    },
    {
      label: 'Edit Invoice',
      icon: 'Edit',
      action: 'edit',
      variant: 'ghost'
    },
    {
      label: 'Duplicate',
      icon: 'Copy',
      action: 'duplicate',
      variant: 'ghost'
    },
    {
      label: 'Download PDF',
      icon: 'Download',
      action: 'download',
      variant: 'ghost'
    },
    {
      label: 'Send Reminder',
      icon: 'Send',
      action: 'remind',
      variant: 'ghost',
      show: invoice?.status === 'pending' || invoice?.status === 'overdue'
    },
    {
      label: 'Mark as Paid',
      icon: 'CheckCircle',
      action: 'markPaid',
      variant: 'ghost',
      show: invoice?.status !== 'paid' && invoice?.status !== 'cancelled'
    },
    {
      label: 'Delete',
      icon: 'Trash2',
      action: 'delete',
      variant: 'ghost',
      className: 'text-error hover:text-error hover:bg-error/10'
    }
  ];

  const visibleActions = actions?.filter(action => action?.show !== false);
  const quickActions = visibleActions?.slice(0, 3);
  const dropdownActions = visibleActions?.slice(3);

  const handleAction = (actionType) => {
    onAction(invoice, actionType);
    setIsDropdownOpen(false);
  };

  if (isMobile) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          iconName="MoreHorizontal"
        >
          Actions
        </Button>
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-[1000]"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg modal-shadow z-[1100]">
              <div className="py-2">
                {visibleActions?.map((action, index) => (
                  <button
                    key={action?.action}
                    onClick={() => handleAction(action?.action)}
                    className={`
                      flex items-center space-x-2 w-full px-4 py-2 text-sm text-left transition-smooth
                      ${action?.className || 'text-popover-foreground hover:bg-muted'}
                    `}
                  >
                    <Icon name={action?.icon} size={16} />
                    <span>{action?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`
      flex items-center space-x-1 transition-smooth
      ${isVisible ? 'opacity-100' : 'opacity-0 lg:opacity-100'}
    `}>
      {/* Quick Actions */}
      {quickActions?.map((action) => (
        <Button
          key={action?.action}
          variant="ghost"
          size="sm"
          onClick={() => handleAction(action?.action)}
          iconName={action?.icon}
          className="h-8 w-8 p-0"
        />
      ))}
      {/* More Actions Dropdown */}
      {dropdownActions?.length > 0 && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            iconName="MoreHorizontal"
            className="h-8 w-8 p-0"
          />

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-[1000]"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg modal-shadow z-[1100]">
                <div className="py-2">
                  {dropdownActions?.map((action) => (
                    <button
                      key={action?.action}
                      onClick={() => handleAction(action?.action)}
                      className={`
                        flex items-center space-x-2 w-full px-4 py-2 text-sm text-left transition-smooth
                        ${action?.className || 'text-popover-foreground hover:bg-muted'}
                      `}
                    >
                      <Icon name={action?.icon} size={16} />
                      <span>{action?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceActions;