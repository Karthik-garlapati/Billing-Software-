import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ItemCard = ({ item, isSelected, onSelect, onEdit, onDelete }) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className={`bg-card border rounded-lg p-4 transition-all hover:shadow-md ${
      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
    }`}>
      {/* Selection Checkbox */}
      <div className="flex items-start justify-between mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="mt-1"
        />
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit"
            onClick={onEdit}
            className="p-1 h-8 w-8"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={onDelete}
            className="p-1 h-8 w-8 text-destructive hover:text-destructive"
          />
        </div>
      </div>
      
      {/* Item Image */}
      <div className="h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
        {item?.image_url ? (
          <img
            src={item?.image_url}
            alt={item?.name}
            className="h-full w-full object-cover rounded-lg"
          />
        ) : (
          <Icon name="Package" size={32} className="text-muted-foreground" />
        )}
      </div>
      
      {/* Item Info */}
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-foreground truncate" title={item?.name}>
            {item?.name}
          </h3>
          {item?.sku && (
            <p className="text-xs text-muted-foreground">SKU: {item?.sku}</p>
          )}
        </div>
        
        {item?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2" title={item?.description}>
            {item?.description}
          </p>
        )}
        
        {item?.category && (
          <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
            {item?.category}
          </span>
        )}
      </div>
      
      {/* Price and Stock */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-foreground">
              {formatINR(item?.price_inr)}
            </div>
            <div className={`text-sm ${
              item?.stock_quantity > 0 ? 'text-muted-foreground' : 'text-destructive'
            }`}>
              Stock: {item?.stock_quantity}
              {item?.stock_quantity <= 5 && item?.stock_quantity > 0 && (
                <span className="text-amber-600 ml-1">⚠️</span>
              )}
              {item?.stock_quantity === 0 && (
                <span className="text-destructive ml-1">❌</span>
              )}
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            item?.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {item?.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
