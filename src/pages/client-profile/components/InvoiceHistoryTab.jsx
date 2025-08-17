import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InvoiceHistoryTab = ({ clientId }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-08-15',
      dueDate: '2024-09-14',
      amount: 2500.00,
      status: 'paid',
      paidDate: '2024-08-20',
      description: 'Website Development Services'
    },
    {
      id: 'INV-2024-002',
      date: '2024-07-15',
      dueDate: '2024-08-14',
      amount: 1800.00,
      status: 'paid',
      paidDate: '2024-07-25',
      description: 'Monthly Maintenance'
    },
    {
      id: 'INV-2024-003',
      date: '2024-06-15',
      dueDate: '2024-07-15',
      amount: 3200.00,
      status: 'overdue',
      paidDate: null,
      description: 'E-commerce Integration'
    },
    {
      id: 'INV-2024-004',
      date: '2024-05-15',
      dueDate: '2024-06-14',
      amount: 1500.00,
      status: 'paid',
      paidDate: '2024-06-10',
      description: 'SEO Optimization'
    },
    {
      id: 'INV-2024-005',
      date: '2024-04-15',
      dueDate: '2024-05-15',
      amount: 2200.00,
      status: 'pending',
      paidDate: null,
      description: 'Mobile App Development'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue':
        return 'bg-error/10 text-error border-error/20';
      case 'draft':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'overdue':
        return 'AlertCircle';
      case 'draft':
        return 'FileText';
      default:
        return 'FileText';
    }
  };

  const filteredInvoices = invoices?.filter(invoice => {
    if (filterStatus === 'all') return true;
    return invoice?.status === filterStatus;
  });

  const sortedInvoices = [...filteredInvoices]?.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'amount':
        return b?.amount - a?.amount;
      case 'status':
        return a?.status?.localeCompare(b?.status);
      default:
        return 0;
    }
  });

  const totalInvoiced = invoices?.reduce((sum, inv) => sum + inv?.amount, 0);
  const totalPaid = invoices?.filter(inv => inv?.status === 'paid')?.reduce((sum, inv) => sum + inv?.amount, 0);
  const totalOutstanding = invoices?.filter(inv => inv?.status !== 'paid')?.reduce((sum, inv) => sum + inv?.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="FileText" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalInvoiced?.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalPaid?.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertCircle" size={16} className="text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${totalOutstanding?.toLocaleString()}</p>
        </div>
      </div>
      {/* Filters and Controls */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e?.target?.value)}
                className="px-3 py-1 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="px-3 py-1 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate(`/create-edit-invoice?client=${clientId}`)}
          >
            New Invoice
          </Button>
        </div>
      </div>
      {/* Invoice List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-foreground">Invoice</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedInvoices?.map((invoice) => (
                <tr key={invoice?.id} className="hover:bg-muted/20 transition-smooth">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-foreground">{invoice?.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice?.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(invoice.date)?.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(invoice.dueDate)?.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">
                    ${invoice?.amount?.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice?.status)}`}>
                      <Icon name={getStatusIcon(invoice?.status)} size={12} />
                      <span>{invoice?.status?.charAt(0)?.toUpperCase() + invoice?.status?.slice(1)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/create-edit-invoice?id=${invoice?.id}`)}
                        className="p-1 hover:bg-muted rounded transition-smooth"
                        title="Edit Invoice"
                      >
                        <Icon name="Edit" size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-1 hover:bg-muted rounded transition-smooth"
                        title="Download PDF"
                      >
                        <Icon name="Download" size={16} className="text-muted-foreground" />
                      </button>
                      <button
                        className="p-1 hover:bg-muted rounded transition-smooth"
                        title="Send Email"
                      >
                        <Icon name="Mail" size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedInvoices?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
            <p className="text-muted-foreground mb-4">
              {filterStatus === 'all' ?'This client has no invoices yet.' 
                : `No ${filterStatus} invoices found.`
              }
            </p>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => navigate(`/create-edit-invoice?client=${clientId}`)}
            >
              Create First Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHistoryTab;