import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ItemFilters = ({ filters, categories, onFilterChange, itemCount }) => {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price_inr', label: 'Price' },
    { value: 'stock_quantity', label: 'Stock' },
    { value: 'category', label: 'Category' },
    { value: 'created_at', label: 'Date Added' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories?.map(cat => ({ value: cat, label: cat }))
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            label="Search Items"
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by name, description, or SKU..."
            iconName="Search"
          />
        </div>
        
        {/* Category Filter */}
        <div>
          <Select
            label="Category"
            value={filters?.category}
            onChange={(value) => onFilterChange('category', value)}
            options={categoryOptions}
          />
        </div>
        
        {/* Sort By */}
        <div>
          <Select
            label="Sort By"
            value={filters?.sortBy}
            onChange={(value) => onFilterChange('sortBy', value)}
            options={sortOptions}
          />
        </div>
        
        {/* Additional Filters */}
        <div className="flex items-end space-x-2">
          <Button
            variant={filters?.sortOrder === 'desc' ? 'default' : 'outline'}
            size="sm"
            iconName={filters?.sortOrder === 'desc' ? 'ArrowDown' : 'ArrowUp'}
            onClick={() => onFilterChange('sortOrder', filters?.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-10"
          />
          
          <Button
            variant={filters?.inStock ? 'default' : 'outline'}
            size="sm"
            iconName="Package"
            onClick={() => onFilterChange('inStock', !filters?.inStock)}
            className="h-10"
            title="Show only items in stock"
          />
        </div>
      </div>
      
      {/* Results Count */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {itemCount} item{itemCount !== 1 ? 's' : ''}
          {filters?.search && ` matching "${filters?.search}"`}
          {filters?.category !== 'all' && ` in ${filters?.category}`}
          {filters?.inStock && ` (in stock only)`}
        </div>
        
        {/* Clear Filters */}
        {(filters?.search || filters?.category !== 'all' || filters?.inStock) && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={() => {
              onFilterChange('search', '');
              onFilterChange('category', 'all');
              onFilterChange('inStock', false);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default ItemFilters;
