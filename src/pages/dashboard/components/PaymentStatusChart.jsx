import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const PaymentStatusChart = ({ data = [] }) => {
  const COLORS = {
    paid: 'var(--color-success)',
    pending: 'var(--color-warning)',
    overdue: 'var(--color-error)',
    draft: 'var(--color-secondary)'
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 modal-shadow">
          <div className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data?.color }}
            />
            <span className="font-medium text-popover-foreground capitalize">
              {data?.payload?.name}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Amount: {formatCurrency(data?.value)}
          </div>
          <div className="text-sm text-muted-foreground">
            Count: {data?.payload?.count} invoices
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry?.color }}
            />
            <span className="text-sm text-foreground capitalize">{entry?.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const totalAmount = data?.reduce((sum, item) => sum + item?.value, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Payment Status</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="DollarSign" size={16} />
          <span>Total: {formatCurrency(totalAmount)}</span>
        </div>
      </div>
      {data?.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS?.[entry?.name] || COLORS?.draft}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex flex-col items-center justify-center">
          <Icon name="PieChart" size={48} className="text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No data available</h4>
          <p className="text-muted-foreground text-center">
            Create some invoices to see payment status breakdown
          </p>
        </div>
      )}
      {data?.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data?.map((item) => (
            <div key={item?.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS?.[item?.name] }}
                />
                <span className="text-sm font-medium text-foreground capitalize">
                  {item?.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {formatCurrency(item?.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item?.count} invoices
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentStatusChart;