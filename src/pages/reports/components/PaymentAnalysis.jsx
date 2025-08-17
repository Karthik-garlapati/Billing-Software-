import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';

const PaymentAnalysis = () => {
  const paymentStatusData = [
    { name: 'Paid', value: 68, count: 245, color: 'var(--color-success)' },
    { name: 'Pending', value: 18, count: 65, color: 'var(--color-warning)' },
    { name: 'Overdue', value: 14, count: 50, color: 'var(--color-error)' }
  ];

  const paymentTimeData = [
    { range: '0-7 days', count: 145, percentage: 40.3 },
    { range: '8-15 days', count: 98, percentage: 27.2 },
    { range: '16-30 days', count: 67, percentage: 18.6 },
    { range: '31+ days', count: 50, percentage: 13.9 }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 modal-shadow">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">
            {data?.count} invoices ({data?.value}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const PaymentTimeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 modal-shadow">
          <p className="text-sm font-medium text-popover-foreground">{label}</p>
          <p className="text-sm text-primary">
            {payload?.[0]?.value} invoices ({payload?.[0]?.payload?.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Payment Status Distribution */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Payment Status</h3>
            <p className="text-sm text-muted-foreground">Current invoice status distribution</p>
          </div>
          <Icon name="PieChart" size={20} className="text-muted-foreground" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {paymentStatusData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {paymentStatusData?.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-sm font-medium text-foreground">{item?.value}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{item?.name}</p>
              <p className="text-xs text-muted-foreground">{item?.count} invoices</p>
            </div>
          ))}
        </div>
      </div>
      {/* Payment Time Analysis */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Payment Timeline</h3>
            <p className="text-sm text-muted-foreground">Average payment collection time</p>
          </div>
          <Icon name="Clock" size={20} className="text-muted-foreground" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="range" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<PaymentTimeTooltip />} />
              <Bar 
                dataKey="count" 
                fill="var(--color-accent)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={16} className="text-accent" />
            <span className="text-sm text-muted-foreground">Avg Payment Time:</span>
            <span className="text-sm font-medium text-foreground">12.3 days</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="TrendingDown" size={16} className="text-success" />
            <span className="text-sm font-medium text-success">-2.1 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalysis;