import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ReportFilters = ({ onFiltersChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '6months',
    startDate: '',
    endDate: '',
    client: 'all',
    status: 'all',
    serviceType: 'all'
  });

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'techcorp', label: 'TechCorp Solutions' },
    { value: 'digitalmarketing', label: 'Digital Marketing Pro' },
    { value: 'startuphub', label: 'StartupHub Inc.' },
    { value: 'creative', label: 'Creative Agency Ltd' },
    { value: 'ecommerce', label: 'E-commerce Plus' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'draft', label: 'Draft' }
  ];

  const serviceTypeOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'design', label: 'Design Services' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: '6months',
      startDate: '',
      endDate: '',
      client: 'all',
      status: 'all',
      serviceType: 'all'
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleExport = (format) => {
    // Mock export functionality
    console.log(`Exporting report as ${format}...`);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Report Filters</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              iconName="FileText"
            >
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              iconName="Download"
            >
              CSV
            </Button>
          </div>
        </div>
      </div>
      {/* Basic Filters - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
        
        <Select
          label="Client"
          options={clientOptions}
          value={filters?.client}
          onChange={(value) => handleFilterChange('client', value)}
        />
        
        <Select
          label="Invoice Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />
      </div>
      {/* Custom Date Range - Show when custom is selected */}
      {filters?.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
          <Input
            label="Start Date"
            type="date"
            value={filters?.startDate}
            onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={filters?.endDate}
            onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
          />
        </div>
      )}
      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Service Type"
              options={serviceTypeOptions}
              value={filters?.serviceType}
              onChange={(value) => handleFilterChange('serviceType', value)}
            />
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleReset}
                iconName="RotateCcw"
                iconPosition="left"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters)?.map(([key, value]) => {
              if (value && value !== 'all' && value !== '6months') {
                const label = key === 'dateRange' ? 
                  dateRangeOptions?.find(opt => opt?.value === value)?.label :
                  key === 'client' ?
                  clientOptions?.find(opt => opt?.value === value)?.label :
                  key === 'status' ?
                  statusOptions?.find(opt => opt?.value === value)?.label :
                  key === 'serviceType' ?
                  serviceTypeOptions?.find(opt => opt?.value === value)?.label :
                  value;

                return (
                  <div
                    key={key}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <span>{label}</span>
                    <button
                      onClick={() => handleFilterChange(key, key === 'dateRange' ? '6months' : 'all')}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;