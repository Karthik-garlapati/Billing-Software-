import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InvoicePreview = ({ 
  companyInfo, 
  selectedClient, 
  invoiceDetails, 
  lineItems,
  taxRate = 0,
  discountAmount = 0,
  onDownloadPDF,
  onSendInvoice
}) => {
  const clientOptions = [
    {
      value: "client-1",
      label: "Acme Corporation",
      email: "acme@corporation.com",
      address: "123 Client Street, Business City, BC 12345",
      phone: "+1 (555) 987-6543"
    },
    {
      value: "client-2",
      label: "Tech Solutions Inc.",
      email: "contact@techsolutions.com",
      address: "456 Tech Avenue, Innovation City, IC 67890",
      phone: "+1 (555) 123-7890"
    },
    {
      value: "client-3",
      label: "Global Enterprises",
      email: "info@globalenterprises.com",
      address: "789 Global Plaza, Enterprise City, EC 11223",
      phone: "+1 (555) 456-1122"
    }
  ];

  const selectedClientData = clientOptions?.find(c => c?.value === selectedClient);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-success bg-success/10 border-success/20';
      case 'overdue':
        return 'text-error bg-error/10 border-error/20';
      case 'sent':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'draft':
        return 'text-muted-foreground bg-muted/50 border-border';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-muted/30 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Invoice Preview</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={onDownloadPDF}
            >
              PDF
            </Button>
            
            <Button
              variant="default"
              size="sm"
              iconName="Send"
              iconPosition="left"
              onClick={onSendInvoice}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
      {/* Invoice Content */}
      <div className="p-6 bg-white text-black min-h-[600px]">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            {invoiceDetails?.status && (
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoiceDetails?.status)}`}>
                {invoiceDetails?.status?.toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="text-right">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
              <Icon name="Receipt" size={32} color="white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{companyInfo?.name || 'Your Company'}</h2>
          </div>
        </div>

        {/* Company and Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">From</h3>
            <div className="space-y-1 text-gray-900">
              <p className="font-semibold">{companyInfo?.name || 'Your Company Name'}</p>
              <p>{companyInfo?.address || '123 Your Street, Your City, YS 12345'}</p>
              <p>{companyInfo?.email || 'your@company.com'}</p>
              <p>{companyInfo?.phone || '+1 (555) 123-4567'}</p>
              {companyInfo?.website && <p>{companyInfo?.website}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Bill To</h3>
            <div className="space-y-1 text-gray-900">
              {selectedClientData ? (
                <>
                  <p className="font-semibold">{selectedClientData?.label}</p>
                  <p>{selectedClientData?.address}</p>
                  <p>{selectedClientData?.email}</p>
                  <p>{selectedClientData?.phone}</p>
                </>
              ) : (
                <p className="text-gray-500 italic">Select a client to display information</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-semibold text-gray-900">{invoiceDetails?.number || 'INV-2025-0001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(invoiceDetails?.date) || 'Select date'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-semibold text-gray-900">{formatDate(invoiceDetails?.dueDate) || 'Select due date'}</span>
              </div>
              {invoiceDetails?.poNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">PO Number:</span>
                  <span className="font-semibold text-gray-900">{invoiceDetails?.poNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Description
                </th>
                <th className="text-center py-3 text-sm font-semibold text-gray-600 uppercase tracking-wide w-20">
                  Qty
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600 uppercase tracking-wide w-24">
                  Rate
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600 uppercase tracking-wide w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems?.length > 0 ? (
                lineItems?.map((item, index) => (
                  <tr key={item?.id} className="border-b border-gray-200">
                    <td className="py-3 text-gray-900">
                      {item?.description || `Line item ${index + 1}`}
                    </td>
                    <td className="py-3 text-center text-gray-900">
                      {item?.quantity || 0}
                    </td>
                    <td className="py-3 text-right text-gray-900">
                      {formatCurrency(item?.rate)}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(item?.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 italic">
                    Add line items to see them here
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-900">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-gray-900">
                <span>Discount:</span>
                <span className="font-semibold text-green-600">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            {taxRate > 0 && (
              <div className="flex justify-between text-gray-900">
                <span>Tax ({taxRate}%):</span>
                <span className="font-semibold">{formatCurrency(calculateTaxAmount())}</span>
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 pt-2">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(invoiceDetails?.notes || invoiceDetails?.terms) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
            {invoiceDetails?.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Notes</h4>
                <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                  {invoiceDetails?.notes}
                </p>
              </div>
            )}
            
            {invoiceDetails?.terms && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Terms & Conditions</h4>
                <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                  {invoiceDetails?.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;