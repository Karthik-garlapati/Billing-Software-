import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActions = ({ className = '' }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Create New Invoice',
      description: 'Generate a professional invoice for your clients',
      icon: 'FileText',
      iconColor: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
      action: () => navigate('/create-edit-invoice'),
      primary: true
    },
    {
      title: 'Add New Client',
      description: 'Add client information for future invoicing',
      icon: 'UserPlus',
      iconColor: 'var(--color-success)',
      bgColor: 'bg-success/10',
      action: () => navigate('/client-list?action=add')
    },
    {
      title: 'View Reports',
      description: 'Analyze your business performance and trends',
      icon: 'BarChart3',
      iconColor: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
      action: () => navigate('/reports')
    },
    {
      title: 'Manage Clients',
      description: 'View and edit your client database',
      icon: 'Users',
      iconColor: 'var(--color-secondary)',
      bgColor: 'bg-secondary/10',
      action: () => navigate('/client-list')
    }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg p-6 card-shadow ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            Common tasks to manage your business
          </p>
        </div>
        <Icon name="Zap" size={20} className="text-warning" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions?.map((action, index) => (
          <button
            key={index}
            onClick={action?.action}
            className={`
              p-4 rounded-lg border border-border hover:border-primary/30 
              transition-smooth text-left group hover:bg-muted/30
              ${action?.primary ? 'ring-2 ring-primary/20' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg ${action?.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon name={action?.icon} size={20} color={action?.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-smooth">
                  {action?.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {action?.description}
                </p>
              </div>
              <Icon 
                name="ArrowRight" 
                size={16} 
                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" 
              />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date()?.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <Button variant="ghost" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;