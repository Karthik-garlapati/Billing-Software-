import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionButton = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getContextualActions = () => {
    const path = location?.pathname;
    
    if (path === '/dashboard' || path === '/') {
      return [
        {
          label: 'New Invoice',
          icon: 'FileText',
          action: () => navigate('/create-edit-invoice'),
          primary: true
        },
        {
          label: 'Add Client',
          icon: 'UserPlus',
          action: () => navigate('/client-list?action=add')
        }
      ];
    }
    
    if (path?.startsWith('/invoice')) {
      return [
        {
          label: 'New Invoice',
          icon: 'Plus',
          action: () => navigate('/create-edit-invoice'),
          primary: true
        }
      ];
    }
    
    if (path?.startsWith('/client')) {
      return [
        {
          label: 'Add Client',
          icon: 'UserPlus',
          action: () => navigate('/client-list?action=add'),
          primary: true
        }
      ];
    }
    
    if (path?.startsWith('/reports')) {
      return [
        {
          label: 'New Invoice',
          icon: 'FileText',
          action: () => navigate('/create-edit-invoice'),
          primary: true
        }
      ];
    }

    // Default action
    return [
      {
        label: 'New Invoice',
        icon: 'Plus',
        action: () => navigate('/create-edit-invoice'),
        primary: true
      }
    ];
  };

  const actions = getContextualActions();
  const primaryAction = actions?.find(action => action?.primary) || actions?.[0];
  const secondaryActions = actions?.filter(action => !action?.primary);

  const handlePrimaryAction = () => {
    if (secondaryActions?.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      primaryAction?.action();
    }
  };

  const handleSecondaryAction = (action) => {
    action?.action();
    setIsExpanded(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[1000] ${className}`}>
      {/* Secondary Actions */}
      {isExpanded && secondaryActions?.length > 0 && (
        <div className="mb-3 space-y-2">
          {secondaryActions?.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-end animate-in slide-in-from-bottom-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mr-3 px-3 py-1 bg-popover border border-border rounded-lg text-sm font-medium text-popover-foreground modal-shadow">
                {action?.label}
              </div>
              <button
                onClick={() => handleSecondaryAction(action)}
                className="w-12 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full modal-shadow transition-smooth flex items-center justify-center"
              >
                <Icon name={action?.icon} size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Primary Action Button */}
      <div className="relative">
        <button
          onClick={handlePrimaryAction}
          className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full modal-shadow transition-smooth flex items-center justify-center group"
        >
          {secondaryActions?.length > 0 ? (
            <Icon 
              name={isExpanded ? "X" : "Plus"} 
              size={24} 
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          ) : (
            <Icon name={primaryAction?.icon} size={24} />
          )}
        </button>

        {/* Tooltip for single action */}
        {secondaryActions?.length === 0 && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-popover border border-border rounded-lg text-sm font-medium text-popover-foreground modal-shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {primaryAction?.label}
          </div>
        )}
      </div>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default QuickActionButton;