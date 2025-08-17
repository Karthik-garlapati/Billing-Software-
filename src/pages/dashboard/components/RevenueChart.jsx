import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const RevenueChart = ({ data = [], period = 'month' }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 modal-shadow">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry?.name}: {formatCurrency(entry?.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const maxValue = Math.max(...data?.map(item => Math.max(item?.revenue || 0, item?.target || 0)));
  const yAxisMax = Math.ceil(maxValue * 1.1 / 1000) * 1000;

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
          <p className="text-sm text-muted-foreground">
            Monthly revenue vs target comparison
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-sm text-muted-foreground">Target</span>
          </div>
        </div>
      </div>
      {data?.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="period" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={formatCurrency}
                domain={[0, yAxisMax]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="var(--color-secondary)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 3 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex flex-col items-center justify-center">
          <Icon name="TrendingUp" size={48} className="text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No revenue data</h4>
          <p className="text-muted-foreground text-center">
            Start creating and sending invoices to track your revenue trends
          </p>
        </div>
      )}
      {data?.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} color="var(--color-primary)" />
              <span className="text-sm font-medium text-foreground">Avg. Monthly</span>
            </div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(data?.reduce((sum, item) => sum + (item?.revenue || 0), 0) / data?.length)}
            </div>
          </div>
          
          <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Target" size={16} color="var(--color-success)" />
              <span className="text-sm font-medium text-foreground">Target Hit Rate</span>
            </div>
            <div className="text-xl font-bold text-success">
              {Math.round((data?.filter(item => (item?.revenue || 0) >= (item?.target || 0))?.length / data?.length) * 100)}%
            </div>
          </div>
          
          <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Calendar" size={16} color="var(--color-warning)" />
              <span className="text-sm font-medium text-foreground">Best Month</span>
            </div>
            <div className="text-xl font-bold text-warning">
              {data?.reduce((best, current) => 
                (current?.revenue || 0) > (best?.revenue || 0) ? current : best, 
                data?.[0] || {}
              )?.period || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;