import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InvoiceFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  clientOptions = [],
  isExpanded = false,
  onToggleExpanded
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'draft', label: 'Draft' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      client: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = () => {
    return localFilters?.search || 
           localFilters?.status !== 'all' || 
           localFilters?.client !== 'all' || 
           localFilters?.dateRange !== 'all' ||
           localFilters?.minAmount ||
           localFilters?.maxAmount;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Quick Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 lg:max-w-md">
          <Input
            type="search"
            placeholder="Search invoices by number or client..."
            value={localFilters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={statusOptions}
            value={localFilters?.status}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Filter by status"
          />
        </div>

        {/* Client Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={[{ value: 'all', label: 'All Clients' }, ...clientOptions]}
            value={localFilters?.client}
            onChange={(value) => handleFilterChange('client', value)}
            placeholder="Filter by client"
            searchable
          />
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={onToggleExpanded}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
        >
          {isExpanded ? 'Less' : 'More'} Filters
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            onClick={handleClearAll}
            iconName="X"
            iconPosition="left"
          >
            Clear All
          </Button>
        )}
      </div>
      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="border-t border-border pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <Select
                label="Date Range"
                options={dateRangeOptions}
                value={localFilters?.dateRange}
                onChange={(value) => handleFilterChange('dateRange', value)}
              />
            </div>

            {/* Custom Date Range */}
            {localFilters?.dateRange === 'custom' && (
              <>
                <div>
                  <Input
                    label="Start Date"
                    type="date"
                    value={localFilters?.startDate}
                    onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
                  />
                </div>
                <div>
                  <Input
                    label="End Date"
                    type="date"
                    value={localFilters?.endDate}
                    onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
                  />
                </div>
              </>
            )}

            {/* Amount Range */}
            <div>
              <Input
                label="Min Amount ($)"
                type="number"
                placeholder="0.00"
                value={localFilters?.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e?.target?.value)}
              />
            </div>
            <div>
              <Input
                label="Max Amount ($)"
                type="number"
                placeholder="10,000.00"
                value={localFilters?.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e?.target?.value)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {localFilters?.search && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              <span>Search: "{localFilters?.search}"</span>
              <button
                onClick={() => handleFilterChange('search', '')}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}

          {localFilters?.status !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              <span>Status: {statusOptions?.find(s => s?.value === localFilters?.status)?.label}</span>
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}

          {localFilters?.client !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              <span>Client: {clientOptions?.find(c => c?.value === localFilters?.client)?.label}</span>
              <button
                onClick={() => handleFilterChange('client', 'all')}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;