import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ReceiptPreview = ({ receipt, onClose, onPrint }) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Receipt Preview</h2>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            className="p-2"
          />
        </div>
        
        {/* Receipt Content */}
        <div className="p-6 space-y-4 font-mono text-sm">
          {/* Company Header */}
          <div className="text-center border-b border-dashed border-border pb-4">
            <h3 className="font-bold text-lg">BillTracker Pro</h3>
            <p className="text-muted-foreground text-xs">
              Your Business Address<br />
              Phone: +91 98765 43210<br />
              info@billtrackerpro.com
            </p>
          </div>
          
          {/* Receipt Info */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt No:</span>
              <span className="font-medium">{receipt?.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{formatDate(receipt?.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span>{receipt?.customer_name}</span>
            </div>
            {receipt?.customer_phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{receipt?.customer_phone}</span>
              </div>
            )}
          </div>
          
          {/* Items */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium border-b border-border pb-2 mb-2">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>
            
            {receipt?.receipt_items?.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 text-xs py-1 border-b border-dotted border-border">
                <span className="truncate" title={item?.item_name}>{item?.item_name}</span>
                <span className="text-center">{item?.quantity}</span>
                <span className="text-right">{formatINR(item?.price_inr)}</span>
                <span className="text-right">{formatINR(item?.line_total)}</span>
              </div>
            ))}
          </div>
          
          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatINR(receipt?.subtotal)}</span>
            </div>
            
            {receipt?.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="text-green-600">-{formatINR(receipt?.discount_amount)}</span>
              </div>
            )}
            
            {receipt?.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({receipt?.tax_rate}%):</span>
                <span>{formatINR(receipt?.tax_amount)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
              <span>TOTAL:</span>
              <span>{formatINR(receipt?.total_amount)}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Payment:</span>
              <span className="uppercase">{receipt?.payment_method}</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center border-t border-dashed border-border pt-4 text-xs">
            <p className="font-medium">Thank You for Your Business!</p>
            <p className="text-muted-foreground mt-1">Have a great day!</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-border">
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={() => {
              // Here you could implement PDF download
              alert('PDF download feature can be implemented');
            }}
          >
            Download PDF
          </Button>
          <Button
            iconName="Printer"
            iconPosition="left"
            onClick={onPrint}
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
