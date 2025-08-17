import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RevenueChart = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('6months');

  const revenueData = [
    { month: 'Feb', revenue: 12500, invoices: 45, year: 2024 },
    { month: 'Mar', revenue: 18200, invoices: 62, year: 2024 },
    { month: 'Apr', revenue: 15800, invoices: 58, year: 2024 },
    { month: 'May', revenue: 22100, invoices: 71, year: 2024 },
    { month: 'Jun', revenue: 19500, invoices: 65, year: 2024 },
    { month: 'Jul', revenue: 25300, invoices: 78, year: 2024 },
    { month: 'Aug', revenue: 28700, invoices: 85, year: 2024 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 modal-shadow">
          <p className="text-sm font-medium text-popover-foreground mb-1">{label} 2024</p>
          <p className="text-sm text-success">
            Revenue: ${payload?.[0]?.value?.toLocaleString()}
          </p>
          {payload?.[0]?.payload?.invoices && (
            <p className="text-xs text-muted-foreground mt-1">
              {payload?.[0]?.payload?.invoices} invoices
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue trends and growth</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            iconName="BarChart3"
            iconPosition="left"
          >
            Bar
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
            iconName="TrendingUp"
            iconPosition="left"
          >
            Line
          </Button>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-sm text-muted-foreground">Growth:</span>
            <span className="text-sm font-medium text-success">+23.5%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">Avg Monthly:</span>
            <span className="text-sm font-medium text-foreground">$20,300</span>
          </div>
        </div>
        
        <Button variant="outline" size="sm" iconName="Download">
          Export
        </Button>
      </div>
    </div>
  );
};

export default RevenueChart;