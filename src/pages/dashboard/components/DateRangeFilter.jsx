import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateRangeFilter = ({ onDateRangeChange, className = '' }) => {
  const [selectedRange, setSelectedRange] = useState('30days');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const predefinedRanges = [
    { value: '7days', label: 'Last 7 days', icon: 'Calendar' },
    { value: '30days', label: 'Last 30 days', icon: 'Calendar' },
    { value: '90days', label: 'Last 90 days', icon: 'Calendar' },
    { value: '1year', label: 'Last year', icon: 'Calendar' },
    { value: 'custom', label: 'Custom range', icon: 'CalendarRange' }
  ];

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    setIsCustomOpen(range === 'custom');
    
    if (range !== 'custom') {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (range) {
        case '7days':
          startDate?.setDate(endDate?.getDate() - 7);
          break;
        case '30days':
          startDate?.setDate(endDate?.getDate() - 30);
          break;
        case '90days':
          startDate?.setDate(endDate?.getDate() - 90);
          break;
        case '1year':
          startDate?.setFullYear(endDate?.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      onDateRangeChange({ startDate, endDate, range });
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      if (startDate <= endDate) {
        onDateRangeChange({ startDate, endDate, range: 'custom' });
        setIsCustomOpen(false);
      }
    }
  };

  const formatDateForInput = (date) => {
    return date?.toISOString()?.split('T')?.[0];
  };

  const getCurrentRangeLabel = () => {
    const range = predefinedRanges?.find(r => r?.value === selectedRange);
    return range ? range?.label : 'Select range';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon name="Filter" size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filter by:</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {predefinedRanges?.map((range) => (
          <button
            key={range?.value}
            onClick={() => handleRangeSelect(range?.value)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth
              ${selectedRange === range?.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon name={range?.icon} size={14} />
            <span>{range?.label}</span>
          </button>
        ))}
      </div>
      {isCustomOpen && (
        <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="CalendarRange" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Custom Date Range</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                max={formatDateForInput(new Date())}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                min={customStartDate}
                max={formatDateForInput(new Date())}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCustomDateApply}
              disabled={!customStartDate || !customEndDate}
            >
              Apply Range
            </Button>
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing data for: {getCurrentRangeLabel()}</span>
        <button
          onClick={() => handleRangeSelect('30days')}
          className="hover:text-foreground transition-smooth"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;