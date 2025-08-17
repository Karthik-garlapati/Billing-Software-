import React from 'react';
import Icon from '../../../components/AppIcon';

const ClientTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'User',
      count: null
    },
    {
      id: 'invoices',
      label: 'Invoice History',
      icon: 'FileText',
      count: 24
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: 'MessageSquare',
      count: 8
    }
  ];

  return (
    <div className="border-b border-border mb-6">
      <nav className="flex space-x-8">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth
              ${activeTab === tab?.id
                ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }
            `}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
            {tab?.count && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ClientTabs;