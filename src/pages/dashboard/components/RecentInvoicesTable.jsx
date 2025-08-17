import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentInvoicesTable = ({ invoices = [], onViewInvoice, onMarkPaid }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle' },
      pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock' },
      overdue: { color: 'bg-error/10 text-error border-error/20', icon: 'AlertCircle' },
      draft: { color: 'bg-muted text-muted-foreground border-border', icon: 'FileText' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
          <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
            View All
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Invoice</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Client</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Due Date</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices?.map((invoice) => (
              <tr key={invoice?.id} className="hover:bg-muted/20 transition-smooth">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Icon name="FileText" size={16} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">#{invoice?.number}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-secondary-foreground">
                        {invoice?.client?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{invoice?.client?.name}</div>
                      <div className="text-sm text-muted-foreground">{invoice?.client?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-foreground">{formatCurrency(invoice?.amount)}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-foreground">{formatDate(invoice?.dueDate)}</span>
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(invoice?.status)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      onClick={() => onViewInvoice(invoice?.id)}
                    >
                      View
                    </Button>
                    {invoice?.status !== 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="CheckCircle"
                        onClick={() => onMarkPaid(invoice?.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invoices?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No invoices yet</h4>
          <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Create Invoice
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentInvoicesTable;