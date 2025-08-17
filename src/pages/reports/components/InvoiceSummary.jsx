import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InvoiceSummary = () => {
  const summaryStats = [
    {
      title: 'Total Invoices',
      value: '360',
      change: '+12.5%',
      trend: 'up',
      icon: 'FileText',
      color: 'primary'
    },
    {
      title: 'Total Revenue',
      value: '$142,600',
      change: '+23.5%',
      trend: 'up',
      icon: 'DollarSign',
      color: 'success'
    },
    {
      title: 'Outstanding Amount',
      value: '$28,450',
      change: '-8.2%',
      trend: 'down',
      icon: 'AlertCircle',
      color: 'warning'
    },
    {
      title: 'Overdue Invoices',
      value: '50',
      change: '-15.3%',
      trend: 'down',
      icon: 'Clock',
      color: 'error'
    }
  ];

  const topClients = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      totalRevenue: 24500,
      invoiceCount: 18,
      lastPayment: '2024-08-15',
      status: 'excellent'
    },
    {
      id: 2,
      name: 'Digital Marketing Pro',
      totalRevenue: 18200,
      invoiceCount: 14,
      lastPayment: '2024-08-12',
      status: 'good'
    },
    {
      id: 3,
      name: 'StartupHub Inc.',
      totalRevenue: 15800,
      invoiceCount: 22,
      lastPayment: '2024-08-10',
      status: 'good'
    },
    {
      id: 4,
      name: 'Creative Agency Ltd',
      totalRevenue: 12300,
      invoiceCount: 16,
      lastPayment: '2024-07-28',
      status: 'warning'
    },
    {
      id: 5,
      name: 'E-commerce Plus',
      totalRevenue: 9800,
      invoiceCount: 12,
      lastPayment: '2024-08-14',
      status: 'excellent'
    }
  ];

  const serviceCategories = [
    { category: 'Web Development', revenue: 45200, percentage: 31.7 },
    { category: 'Digital Marketing', revenue: 32800, percentage: 23.0 },
    { category: 'Consulting', revenue: 28600, percentage: 20.1 },
    { category: 'Design Services', revenue: 21400, percentage: 15.0 },
    { category: 'Maintenance', revenue: 14600, percentage: 10.2 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-success bg-success/10';
      case 'good':
        return 'text-primary bg-primary/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return 'CheckCircle';
      case 'good':
        return 'Circle';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats?.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat?.color}/10`}>
                <Icon 
                  name={stat?.icon} 
                  size={24} 
                  className={`text-${stat?.color}`}
                />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat?.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                <Icon 
                  name={stat?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                  size={16} 
                />
                <span>{stat?.change}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat?.value}</p>
              <p className="text-sm text-muted-foreground">{stat?.title}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Clients</h3>
              <p className="text-sm text-muted-foreground">Highest revenue generating clients</p>
            </div>
            <Button variant="outline" size="sm" iconName="ExternalLink">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {topClients?.map((client, index) => (
              <div key={client?.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client?.invoiceCount} invoices • Last payment: {new Date(client.lastPayment)?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${client?.totalRevenue?.toLocaleString()}</p>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(client?.status)}`}>
                    <Icon name={getStatusIcon(client?.status)} size={12} />
                    <span className="capitalize">{client?.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Categories */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Service Categories</h3>
              <p className="text-sm text-muted-foreground">Revenue breakdown by service type</p>
            </div>
            <Icon name="BarChart3" size={20} className="text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {serviceCategories?.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{service?.category}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">${service?.revenue?.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-2">({service?.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${service?.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="font-semibold text-foreground">$142,600</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;