import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LineItemsSection = ({ 
  lineItems, 
  onLineItemsChange,
  taxRate = 0,
  discountAmount = 0,
  onTaxRateChange,
  onDiscountAmountChange
}) => {
  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const removeLineItem = (id) => {
    onLineItemsChange(lineItems?.filter(item => item?.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    const updatedItems = lineItems?.map(item => {
      if (item?.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = (updatedItem?.quantity || 0) * (updatedItem?.rate || 0);
        }
        
        return updatedItem;
      }
      return item;
    });
    onLineItemsChange(updatedItems);
  };

  const calculateSubtotal = () => {
    return lineItems?.reduce((sum, item) => sum + (item?.amount || 0), 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() - discountAmount) * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discountAmount + calculateTaxAmount();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    })?.format(amount || 0);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="List" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Line Items</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          iconName="Plus"
          iconPosition="left"
          onClick={addLineItem}
        >
          Add Item
        </Button>
      </div>
      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Description
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground w-24">
                Qty
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground w-32">
                Rate
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground w-32">
                Amount
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems?.map((item, index) => (
              <tr key={item?.id} className="border-b border-border/50">
                <td className="py-3 px-2">
                  <Input
                    type="text"
                    placeholder="Product or service description"
                    value={item?.description}
                    onChange={(e) => updateLineItem(item?.id, 'description', e?.target?.value)}
                    className="border-0 bg-transparent p-0 focus:ring-0"
                  />
                </td>
                <td className="py-3 px-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item?.quantity}
                    onChange={(e) => updateLineItem(item?.id, 'quantity', parseFloat(e?.target?.value) || 0)}
                    className="border-0 bg-transparent p-0 text-center focus:ring-0"
                  />
                </td>
                <td className="py-3 px-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item?.rate}
                    onChange={(e) => updateLineItem(item?.id, 'rate', parseFloat(e?.target?.value) || 0)}
                    className="border-0 bg-transparent p-0 text-right focus:ring-0"
                  />
                </td>
                <td className="py-3 px-2 text-right font-medium text-foreground">
                  {formatCurrency(item?.amount)}
                </td>
                <td className="py-3 px-2">
                  {lineItems?.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Trash2"
                      onClick={() => removeLineItem(item?.id)}
                      className="text-error hover:text-error hover:bg-error/10"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lineItems?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Package" size={48} className="mx-auto mb-3 opacity-50" />
          <p>No line items added yet</p>
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={addLineItem}
            className="mt-3"
          >
            Add First Item
          </Button>
        </div>
      )}
      {/* Tax and Discount Settings */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tax Rate (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="0.00"
          value={taxRate}
          onChange={(e) => onTaxRateChange(parseFloat(e?.target?.value) || 0)}
          description="Enter tax percentage (e.g., 8.25 for 8.25%)"
        />

        <Input
          label="Discount Amount ($)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={discountAmount}
          onChange={(e) => onDiscountAmountChange(parseFloat(e?.target?.value) || 0)}
          description="Fixed discount amount in USD"
        />
      </div>
      {/* Totals Summary */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="flex flex-col space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount:</span>
              <span className="font-medium text-success">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%):</span>
              <span className="font-medium">{formatCurrency(calculateTaxAmount())}</span>
            </div>
          )}
          
          <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItemsSection;