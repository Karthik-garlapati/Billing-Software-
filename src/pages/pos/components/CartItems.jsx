import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const CartItems = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateSubtotal = () => {
    return items?.reduce((sum, item) => sum + (item?.quantity * item?.price_inr), 0);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Shopping Cart</h3>
        {items?.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={onClearCart}
            className="text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {items?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="ShoppingCart" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your cart is empty</p>
          <p className="text-sm text-muted-foreground">Add items from the left to start</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto space-y-3">
            {items?.map((item) => (
              <div key={item?.cartId} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                {/* Item Image */}
                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  {item?.image_url ? (
                    <img
                      src={item?.image_url}
                      alt={item?.name}
                      className="h-full w-full object-cover rounded"
                    />
                  ) : (
                    <Icon name="Package" size={16} className="text-muted-foreground" />
                  )}
                </div>
                
                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate" title={item?.name}>
                    {item?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatINR(item?.price_inr)} each
                  </p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Minus"
                    onClick={() => onUpdateQuantity(item?.cartId, item?.quantity - 1)}
                    className="h-8 w-8 p-0"
                  />
                  <Input
                    type="number"
                    min="1"
                    max={item?.stock_quantity}
                    value={item?.quantity}
                    onChange={(e) => onUpdateQuantity(item?.cartId, parseInt(e.target.value) || 1)}
                    className="w-16 text-center h-8"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={() => onUpdateQuantity(item?.cartId, item?.quantity + 1)}
                    disabled={item?.quantity >= item?.stock_quantity}
                    className="h-8 w-8 p-0"
                  />
                </div>
                
                {/* Line Total */}
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {formatINR(item?.quantity * item?.price_inr)}
                  </div>
                </div>
                
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => onRemoveItem(item?.cartId)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                />
              </div>
            ))}
          </div>
          
          {/* Subtotal */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between text-lg font-semibold text-foreground">
              <span>Subtotal:</span>
              <span>{formatINR(calculateSubtotal())}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {items?.length} item{items?.length !== 1 ? 's' : ''} in cart
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;
