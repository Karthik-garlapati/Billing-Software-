import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import StatusBadge from './StatusBadge';
import InvoiceActions from './InvoiceActions';

const InvoiceTable = ({ 
  invoices = [], 
  selectedInvoices = [], 
  onSelectionChange,
  onSort,
  sortConfig,
  onInvoiceAction
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(invoices?.map(invoice => invoice?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectInvoice = (invoiceId, checked) => {
    if (checked) {
      onSelectionChange([...selectedInvoices, invoiceId]);
    } else {
      onSelectionChange(selectedInvoices?.filter(id => id !== invoiceId));
    }
  };

  const handleSort = (column) => {
    const direction = sortConfig?.column === column && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ column, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig?.column !== column) {
      return <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={16} className="text-primary" />
      : <Icon name="ArrowDown" size={16} className="text-primary" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isAllSelected = invoices?.length > 0 && selectedInvoices?.length === invoices?.length;
  const isPartiallySelected = selectedInvoices?.length > 0 && selectedInvoices?.length < invoices?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('invoiceNumber')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Invoice #</span>
                  {getSortIcon('invoiceNumber')}
                </button>
              </th>
              
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('clientName')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Client</span>
                  {getSortIcon('clientName')}
                </button>
              </th>
              
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </button>
              </th>
              
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Due Date</span>
                  {getSortIcon('dueDate')}
                </button>
              </th>
              
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Status</span>
                  {getSortIcon('status')}
                </button>
              </th>
              
              <th className="text-left px-4 py-3">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {invoices?.map((invoice) => (
              <tr
                key={invoice?.id}
                className={`
                  border-b border-border hover:bg-muted/30 transition-smooth
                  ${selectedInvoices?.includes(invoice?.id) ? 'bg-primary/5' : ''}
                `}
                onMouseEnter={() => setHoveredRow(invoice?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedInvoices?.includes(invoice?.id)}
                    onChange={(e) => handleSelectInvoice(invoice?.id, e?.target?.checked)}
                  />
                </td>
                
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground font-data">
                    {invoice?.invoiceNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {formatDate(invoice?.createdDate)}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {invoice?.clientName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invoice?.clientEmail}
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground font-data">
                    {formatCurrency(invoice?.amount)}
                  </div>
                  {invoice?.paidAmount > 0 && invoice?.paidAmount < invoice?.amount && (
                    <div className="text-xs text-success">
                      {formatCurrency(invoice?.paidAmount)} paid
                    </div>
                  )}
                </td>
                
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {formatDate(invoice?.dueDate)}
                  </div>
                  {invoice?.status === 'overdue' && (
                    <div className="text-xs text-error">
                      {Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                    </div>
                  )}
                </td>
                
                <td className="px-4 py-4">
                  <StatusBadge status={invoice?.status} />
                </td>
                
                <td className="px-4 py-4">
                  <InvoiceActions
                    invoice={invoice}
                    onAction={onInvoiceAction}
                    isVisible={hoveredRow === invoice?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {invoices?.map((invoice) => (
          <div
            key={invoice?.id}
            className={`
              border border-border rounded-lg p-4 transition-smooth
              ${selectedInvoices?.includes(invoice?.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedInvoices?.includes(invoice?.id)}
                  onChange={(e) => handleSelectInvoice(invoice?.id, e?.target?.checked)}
                />
                <div>
                  <div className="font-medium text-foreground font-data">
                    {invoice?.invoiceNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invoice?.clientName}
                  </div>
                </div>
              </div>
              <StatusBadge status={invoice?.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Amount</div>
                <div className="font-medium text-foreground font-data">
                  {formatCurrency(invoice?.amount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                <div className="font-medium text-foreground">
                  {formatDate(invoice?.dueDate)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <InvoiceActions
                invoice={invoice}
                onAction={onInvoiceAction}
                isVisible={true}
                isMobile={true}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {invoices?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
          <p className="text-muted-foreground mb-4">
            No invoices match your current filters. Try adjusting your search criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location?.reload()}
            iconName="RefreshCw"
            iconPosition="left"
          >
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;