import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ReceiptCard = ({ receipt, onPrint }) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return 'Banknote';
      case 'card': return 'CreditCard';
      case 'upi': return 'Smartphone';
      case 'net_banking': return 'Building';
      default: return 'DollarSign';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            {receipt?.receipt_number}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(receipt?.created_at)}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          iconName="Printer"
          onClick={onPrint}
          className="p-2"
          title="Print Receipt"
        />
      </div>
      
      {/* Customer Info */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <Icon name="User" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {receipt?.customer_name}
          </span>
        </div>
        {receipt?.customer_phone && (
          <div className="flex items-center space-x-2">
            <Icon name="Phone" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {receipt?.customer_phone}
            </span>
          </div>
        )}
      </div>
      
      {/* Items Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Items:</h4>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {receipt?.receipt_items?.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate flex-1 mr-2">
                {item?.quantity}x {item?.item_name}
              </span>
              <span className="text-foreground">
                {formatINR(item?.line_total)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Totals */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="text-foreground">{formatINR(receipt?.subtotal)}</span>
        </div>
        
        {receipt?.discount_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount:</span>
            <span className="text-green-600">-{formatINR(receipt?.discount_amount)}</span>
          </div>
        )}
        
        {receipt?.tax_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span className="text-foreground">{formatINR(receipt?.tax_amount)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
          <span className="text-foreground">Total:</span>
          <span className="text-foreground">{formatINR(receipt?.total_amount)}</span>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon 
            name={getPaymentMethodIcon(receipt?.payment_method)} 
            size={16} 
            className="text-muted-foreground" 
          />
          <span className="text-sm text-muted-foreground capitalize">
            {receipt?.payment_method?.replace('_', ' ')}
          </span>
        </div>
        
        <span className="text-xs text-muted-foreground">
          {receipt?.receipt_items?.length} item{receipt?.receipt_items?.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default ReceiptCard;
