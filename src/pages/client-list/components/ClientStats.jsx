import React from 'react';
import Icon from '../../../components/AppIcon';

const ClientStats = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.totalClients,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Clients',
      value: stats?.activeClients,
      icon: 'UserCheck',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(stats?.totalOutstanding),
      icon: 'DollarSign',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue),
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat?.title}</p>
              <p className="text-2xl font-semibold text-foreground">{stat?.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientStats;