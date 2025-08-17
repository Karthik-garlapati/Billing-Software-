import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ClientFilters = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  onClearFilters,
  showFilters,
  onToggleFilters
}) => {
  const sortOptions = [
    { value: 'name', label: 'Client Name' },
    { value: 'company', label: 'Company Name' },
    { value: 'outstanding', label: 'Outstanding Balance' },
    { value: 'lastActivity', label: 'Last Activity' },
    { value: 'totalRevenue', label: 'Total Revenue' },
    { value: 'created', label: 'Date Added' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'warning', label: 'Warning' },
    { value: 'poor', label: 'Poor' }
  ];

  const balanceOptions = [
    { value: 'all', label: 'All Balances' },
    { value: 'none', label: 'No Outstanding' },
    { value: 'low', label: 'Under $1,000' },
    { value: 'medium', label: '$1,000 - $5,000' },
    { value: 'high', label: 'Over $5,000' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Search and Toggle */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="search"
            placeholder="Search clients by name, company, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          iconName={showFilters ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
          onClick={onToggleFilters}
        >
          Filters
        </Button>
      </div>
      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Sort By"
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
            />
            
            <Select
              label="Payment Status"
              options={statusOptions}
              value={filterBy?.status}
              onChange={(value) => onFilterChange({ ...filterBy, status: value })}
            />
            
            <Select
              label="Outstanding Balance"
              options={balanceOptions}
              value={filterBy?.balance}
              onChange={(value) => onFilterChange({ ...filterBy, balance: value })}
            />
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                iconName="X"
                iconPosition="left"
                onClick={onClearFilters}
                fullWidth
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFilters;