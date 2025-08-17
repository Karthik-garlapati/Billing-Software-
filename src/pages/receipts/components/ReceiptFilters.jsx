import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ReceiptFilters = ({ filters, onFilterChange, receiptCount }) => {
  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'receipt_number', label: 'Receipt Number' },
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'total_amount', label: 'Total Amount' }
  ];

  const handleDateRangeChange = (type, value) => {
    const dateRange = filters?.dateRange || {};
    onFilterChange('dateRange', { ...dateRange, [type]: value });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div>
          <Input
            label="Search Receipts"
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by receipt number or customer..."
            iconName="Search"
          />
        </div>
        
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            From Date
          </label>
          <Input
            type="date"
            value={filters?.dateRange?.start || ''}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            To Date
          </label>
          <Input
            type="date"
            value={filters?.dateRange?.end || ''}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
          />
        </div>
        
        {/* Sort Options */}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Select
              label="Sort By"
              value={filters?.sortBy}
              onChange={(value) => onFilterChange('sortBy', value)}
              options={sortOptions}
            />
          </div>
          
          <Button
            variant={filters?.sortOrder === 'desc' ? 'default' : 'outline'}
            size="sm"
            iconName={filters?.sortOrder === 'desc' ? 'ArrowDown' : 'ArrowUp'}
            onClick={() => onFilterChange('sortOrder', filters?.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-10"
            title={`Sort ${filters?.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          />
        </div>
      </div>
      
      {/* Results Count and Clear Filters */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {receiptCount} receipt{receiptCount !== 1 ? 's' : ''}
          {filters?.search && ` matching "${filters?.search}"`}
          {filters?.dateRange?.start && ` from ${filters?.dateRange?.start}`}
          {filters?.dateRange?.end && ` to ${filters?.dateRange?.end}`}
        </div>
        
        {/* Clear Filters */}
        {(filters?.search || filters?.dateRange?.start || filters?.dateRange?.end) && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={() => {
              onFilterChange('search', '');
              onFilterChange('dateRange', null);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReceiptFilters;
