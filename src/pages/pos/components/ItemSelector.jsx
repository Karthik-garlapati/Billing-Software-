import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ItemSelector = ({ items, loading, error, filter, onFilterChange, onAddToCart, onRetry }) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const filteredItems = items?.filter(item =>
    item?.name?.toLowerCase()?.includes(filter?.toLowerCase()) ||
    item?.description?.toLowerCase()?.includes(filter?.toLowerCase()) ||
    item?.category?.toLowerCase()?.includes(filter?.toLowerCase()) ||
    item?.sku?.toLowerCase()?.includes(filter?.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Select Items</h3>
        <span className="text-sm text-muted-foreground">
          {filteredItems?.length} items available
        </span>
      </div>
      
      {/* Search Filter */}
      <div className="mb-4">
        <Input
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Search items by name, category, or SKU..."
          iconName="Search"
        />
      </div>
      
      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)]?.map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
              <div className="h-20 bg-muted rounded mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-3"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-destructive text-lg font-medium mb-2">Error Loading Items</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      ) : filteredItems?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground text-lg font-medium mb-2">
            {filter ? 'No items found' : 'No items available'}
          </div>
          <p className="text-muted-foreground">
            {filter 
              ? 'Try adjusting your search terms' 
              : 'Add items to your inventory to start selling'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredItems?.map((item) => (
            <div
              key={item?.id}
              className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Item Image */}
              <div className="h-20 bg-muted rounded-lg mb-3 flex items-center justify-center">
                {item?.image_url ? (
                  <img
                    src={item?.image_url}
                    alt={item?.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <Icon name="Package" size={24} className="text-muted-foreground" />
                )}
              </div>
              
              {/* Item Details */}
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-foreground truncate" title={item?.name}>
                    {item?.name}
                  </h4>
                  {item?.category && (
                    <p className="text-xs text-muted-foreground">{item?.category}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    {formatINR(item?.price_inr)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item?.stock_quantity > 5 
                      ? 'bg-green-100 text-green-800'
                      : item?.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    Stock: {item?.stock_quantity}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  className="w-full"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => onAddToCart(item)}
                  disabled={item?.stock_quantity <= 0 || !item?.is_active}
                >
                  {item?.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
