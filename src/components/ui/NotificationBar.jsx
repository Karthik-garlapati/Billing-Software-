import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationBar = ({ 
  notifications = [], 
  onDismiss = () => {},
  onAction = () => {},
  maxVisible = 3,
  autoHideDuration = 5000 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications?.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  useEffect(() => {
    if (autoHideDuration > 0) {
      visibleNotifications?.forEach(notification => {
        if (notification?.autoHide !== false) {
          const timer = setTimeout(() => {
            handleDismiss(notification?.id);
          }, autoHideDuration);

          return () => clearTimeout(timer);
        }
      });
    }
  }, [visibleNotifications, autoHideDuration]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev?.filter(n => n?.id !== id));
    onDismiss(id);
  };

  const handleAction = (notification, actionIndex) => {
    onAction(notification, actionIndex);
    if (notification?.actions?.[actionIndex]?.dismissOnClick !== false) {
      handleDismiss(notification?.id);
    }
  };

  const getNotificationStyles = (type) => {
    const baseStyles = "border-l-4 bg-card border border-border";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-success bg-success/5`;
      case 'warning':
        return `${baseStyles} border-l-warning bg-warning/5`;
      case 'error':
        return `${baseStyles} border-l-error bg-error/5`;
      case 'info':
      default:
        return `${baseStyles} border-l-primary bg-primary/5`;
    }
  };

  const getIconName = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      case 'info':
      default:
        return 'Info';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      case 'info':
      default:
        return 'var(--color-primary)';
    }
  };

  if (visibleNotifications?.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-[1200] space-y-3 w-full max-w-md">
      {visibleNotifications?.map((notification) => (
        <div
          key={notification?.id}
          className={`
            ${getNotificationStyles(notification?.type)}
            p-4 rounded-lg modal-shadow animate-in slide-in-from-right-full duration-300
          `}
        >
          <div className="flex items-start space-x-3">
            <Icon
              name={getIconName(notification?.type)}
              size={20}
              color={getIconColor(notification?.type)}
              className="flex-shrink-0 mt-0.5"
            />
            
            <div className="flex-1 min-w-0">
              {notification?.title && (
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {notification?.title}
                </h4>
              )}
              
              <p className="text-sm text-muted-foreground">
                {notification?.message}
              </p>
              
              {notification?.actions && notification?.actions?.length > 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  {notification?.actions?.map((action, index) => (
                    <Button
                      key={index}
                      variant={action?.variant || 'outline'}
                      size="xs"
                      onClick={() => handleAction(notification, index)}
                    >
                      {action?.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleDismiss(notification?.id)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-smooth"
            >
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
          
          {notification?.progress !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${notification?.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationBar;