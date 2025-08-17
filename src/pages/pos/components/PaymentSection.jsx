import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PaymentSection = ({ 
  paymentInfo, 
  onPaymentInfoChange, 
  subtotal, 
  discountAmount, 
  taxAmount, 
  total 
}) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'net_banking', label: 'Net Banking' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (field, value) => {
    onPaymentInfoChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Payment Details</h3>
      
      <div className="space-y-4">
        {/* Tax and Discount */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tax Rate (%)"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={paymentInfo?.taxRate}
            onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <Input
            label="Discount (₹)"
            type="number"
            min="0"
            step="0.01"
            value={paymentInfo?.discountAmount}
            onChange={(e) => handleChange('discountAmount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
        
        {/* Payment Method */}
        <Select
          label="Payment Method"
          value={paymentInfo?.method}
          onChange={(value) => handleChange('method', value)}
          options={paymentMethods}
        />
        
        {/* Payment Reference (for non-cash payments) */}
        {paymentInfo?.method !== 'cash' && (
          <Input
            label="Payment Reference"
            value={paymentInfo?.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            placeholder="Transaction ID, Check number, etc."
          />
        )}
        
        {/* Bill Summary */}
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground">{formatINR(subtotal)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-green-600">-{formatINR(discountAmount)}</span>
            </div>
          )}
          
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({paymentInfo?.taxRate}%):</span>
              <span className="text-foreground">{formatINR(taxAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
            <span className="text-foreground">Total:</span>
            <span className="text-foreground">{formatINR(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
