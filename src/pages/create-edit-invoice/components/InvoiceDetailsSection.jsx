import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const InvoiceDetailsSection = ({ 
  invoiceDetails, 
  onInvoiceDetailsChange 
}) => {
  const handleChange = (field, value) => {
    onInvoiceDetailsChange({
      ...invoiceDetails,
      [field]: value
    });
  };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const paymentTermsOptions = [
    { value: "net-15", label: "Net 15 days" },
    { value: "net-30", label: "Net 30 days" },
    { value: "net-45", label: "Net 45 days" },
    { value: "net-60", label: "Net 60 days" },
    { value: "due-on-receipt", label: "Due on receipt" },
    { value: "custom", label: "Custom terms" }
  ];

  // Generate next invoice number
  const generateInvoiceNumber = () => {
    const currentYear = new Date()?.getFullYear();
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    return `INV-${currentYear}-${randomNum?.toString()?.padStart(4, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Invoice Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          label="Invoice Number"
          type="text"
          placeholder="INV-2025-0001"
          value={invoiceDetails?.number || generateInvoiceNumber()}
          onChange={(e) => handleChange('number', e?.target?.value)}
          required
          description="Auto-generated if left empty"
        />

        <Input
          label="Invoice Date"
          type="date"
          value={invoiceDetails?.date}
          onChange={(e) => handleChange('date', e?.target?.value)}
          required
        />

        <Input
          label="Due Date"
          type="date"
          value={invoiceDetails?.dueDate}
          onChange={(e) => handleChange('dueDate', e?.target?.value)}
          required
        />

        <Select
          label="Payment Terms"
          placeholder="Select payment terms"
          options={paymentTermsOptions}
          value={invoiceDetails?.paymentTerms}
          onChange={(value) => handleChange('paymentTerms', value)}
          required
        />

        <Select
          label="Status"
          placeholder="Select status"
          options={statusOptions}
          value={invoiceDetails?.status}
          onChange={(value) => handleChange('status', value)}
          required
        />

        <Input
          label="Purchase Order #"
          type="text"
          placeholder="PO-12345 (Optional)"
          value={invoiceDetails?.poNumber}
          onChange={(e) => handleChange('poNumber', e?.target?.value)}
          description="Client's PO reference"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Invoice Notes
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows={3}
            placeholder="Add any notes for this invoice..."
            value={invoiceDetails?.notes}
            onChange={(e) => handleChange('notes', e?.target?.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Terms & Conditions
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows={3}
            placeholder="Payment terms, late fees, etc..."
            value={invoiceDetails?.terms}
            onChange={(e) => handleChange('terms', e?.target?.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsSection;