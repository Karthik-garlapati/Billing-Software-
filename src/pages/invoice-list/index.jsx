import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationBar from '../../components/ui/NotificationBar';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceTable from './components/InvoiceTable';
import BulkActions from './components/BulkActions';
import InvoicePagination from './components/InvoicePagination';

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState({ column: 'dueDate', direction: 'desc' });

  // Mock data for invoices
  const mockInvoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acme.com',
      amount: 2500.00,
      paidAmount: 0,
      dueDate: '2024-08-25',
      createdDate: '2024-08-10',
      status: 'pending'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      clientName: 'TechStart Solutions',
      clientEmail: 'accounts@techstart.com',
      amount: 1750.00,
      paidAmount: 1750.00,
      dueDate: '2024-08-20',
      createdDate: '2024-08-05',
      status: 'paid'
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Global Industries',
      clientEmail: 'finance@global.com',
      amount: 3200.00,
      paidAmount: 0,
      dueDate: '2024-08-15',
      createdDate: '2024-08-01',
      status: 'overdue'
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Creative Agency',
      clientEmail: 'billing@creative.com',
      amount: 1200.00,
      paidAmount: 600.00,
      dueDate: '2024-08-30',
      createdDate: '2024-08-12',
      status: 'partial'
    },
    {
      id: 'inv-005',
      invoiceNumber: 'INV-2024-005',
      clientName: 'Startup Hub',
      clientEmail: 'payments@startup.com',
      amount: 950.00,
      paidAmount: 0,
      dueDate: '2024-09-05',
      createdDate: '2024-08-15',
      status: 'draft'
    },
    {
      id: 'inv-006',
      invoiceNumber: 'INV-2024-006',
      clientName: 'Enterprise Corp',
      clientEmail: 'ap@enterprise.com',
      amount: 4500.00,
      paidAmount: 4500.00,
      dueDate: '2024-08-18',
      createdDate: '2024-08-03',
      status: 'paid'
    },
    {
      id: 'inv-007',
      invoiceNumber: 'INV-2024-007',
      clientName: 'Local Business',
      clientEmail: 'owner@local.com',
      amount: 800.00,
      paidAmount: 0,
      dueDate: '2024-08-12',
      createdDate: '2024-07-28',
      status: 'overdue'
    },
    {
      id: 'inv-008',
      invoiceNumber: 'INV-2024-008',
      clientName: 'Digital Marketing Co',
      clientEmail: 'billing@digital.com',
      amount: 2100.00,
      paidAmount: 0,
      dueDate: '2024-08-28',
      createdDate: '2024-08-14',
      status: 'pending'
    }
  ];

  // Mock client options for filters
  const clientOptions = [
    { value: 'acme', label: 'Acme Corporation' },
    { value: 'techstart', label: 'TechStart Solutions' },
    { value: 'global', label: 'Global Industries' },
    { value: 'creative', label: 'Creative Agency' },
    { value: 'startup', label: 'Startup Hub' },
    { value: 'enterprise', label: 'Enterprise Corp' },
    { value: 'local', label: 'Local Business' },
    { value: 'digital', label: 'Digital Marketing Co' }
  ];

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    client: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const [filteredInvoices, setFilteredInvoices] = useState(mockInvoices);

  // Filter and sort invoices
  useEffect(() => {
    let filtered = [...mockInvoices];

    // Apply search filter
    if (filters?.search) {
      filtered = filtered?.filter(invoice =>
        invoice?.invoiceNumber?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        invoice?.clientName?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    // Apply status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(invoice => invoice?.status === filters?.status);
    }

    // Apply client filter
    if (filters?.client !== 'all') {
      const clientName = clientOptions?.find(c => c?.value === filters?.client)?.label;
      if (clientName) {
        filtered = filtered?.filter(invoice => invoice?.clientName === clientName);
      }
    }

    // Apply amount filters
    if (filters?.minAmount) {
      filtered = filtered?.filter(invoice => invoice?.amount >= parseFloat(filters?.minAmount));
    }
    if (filters?.maxAmount) {
      filtered = filtered?.filter(invoice => invoice?.amount <= parseFloat(filters?.maxAmount));
    }

    // Apply date range filter
    if (filters?.dateRange !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (filters?.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case 'custom':
          if (filters?.startDate) startDate = new Date(filters.startDate);
          if (filters?.endDate) endDate = new Date(filters.endDate);
          break;
      }

      if (startDate || endDate) {
        filtered = filtered?.filter(invoice => {
          const invoiceDate = new Date(invoice.createdDate);
          return (!startDate || invoiceDate >= startDate) && 
                 (!endDate || invoiceDate <= endDate);
        });
      }
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.column];
      let bValue = b?.[sortConfig?.column];

      if (sortConfig?.column === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig?.column === 'dueDate' || sortConfig?.column === 'createdDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue?.toString()?.toLowerCase() || '';
        bValue = bValue?.toString()?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices?.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      client: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  const handleInvoiceAction = (invoice, action) => {
    switch (action) {
      case 'view':
        addNotification({
          type: 'info',
          title: 'Invoice Details',
          message: `Viewing details for ${invoice?.invoiceNumber}`
        });
        break;
      case 'edit': navigate('/create-edit-invoice', { state: { invoice } });
        break;
      case 'duplicate':
        addNotification({
          type: 'success',
          title: 'Invoice Duplicated',
          message: `Created a copy of ${invoice?.invoiceNumber}`
        });
        break;
      case 'download':
        addNotification({
          type: 'success',
          title: 'PDF Downloaded',
          message: `Downloaded PDF for ${invoice?.invoiceNumber}`
        });
        break;
      case 'remind':
        addNotification({
          type: 'success',
          title: 'Reminder Sent',
          message: `Payment reminder sent for ${invoice?.invoiceNumber}`
        });
        break;
      case 'markPaid':
        addNotification({
          type: 'success',
          title: 'Invoice Updated',
          message: `${invoice?.invoiceNumber} marked as paid`
        });
        break;
      case 'delete':
        addNotification({
          type: 'warning',
          title: 'Invoice Deleted',
          message: `${invoice?.invoiceNumber} has been deleted`
        });
        break;
    }
  };

  const handleBulkAction = (action) => {
    const count = selectedInvoices?.length;
    switch (action) {
      case 'markPaid':
        addNotification({
          type: 'success',
          title: 'Bulk Update Complete',
          message: `${count} invoice(s) marked as paid`
        });
        break;
      case 'markPending':
        addNotification({
          type: 'info',
          title: 'Bulk Update Complete',
          message: `${count} invoice(s) marked as pending`
        });
        break;
      case 'sendReminder':
        addNotification({
          type: 'success',
          title: 'Reminders Sent',
          message: `Payment reminders sent for ${count} invoice(s)`
        });
        break;
      case 'downloadPdf':
        addNotification({
          type: 'success',
          title: 'PDFs Downloaded',
          message: `Downloaded PDFs for ${count} invoice(s)`
        });
        break;
      case 'export':
        addNotification({
          type: 'success',
          title: 'Export Complete',
          message: `Exported ${count} invoice(s) to CSV`
        });
        break;
      case 'delete':
        addNotification({
          type: 'warning',
          title: 'Invoices Deleted',
          message: `${count} invoice(s) have been deleted`
        });
        break;
    }
    setSelectedInvoices([]);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const handleUserMenuClick = (action) => {
    switch (action) {
      case 'profile':
        addNotification({
          type: 'info',
          title: 'Profile',
          message: 'Profile settings opened'
        });
        break;
      case 'settings':
        addNotification({
          type: 'info',
          title: 'Settings',
          message: 'Application settings opened'
        });
        break;
      case 'logout':
        addNotification({
          type: 'info',
          title: 'Signed Out',
          message: 'You have been signed out successfully'
        });
        break;
    }
  };

  const mockUser = {
    name: 'John Smith',
    email: 'john.smith@company.com'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} onUserMenuClick={handleUserMenuClick} />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Invoice Management
              </h1>
              <p className="text-muted-foreground">
                Track and manage all your invoices in one place
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={() => addNotification({
                  type: 'success',
                  title: 'Export Started',
                  message: 'Exporting all invoices to CSV...'
                })}
              >
                Export All
              </Button>
              
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => navigate('/create-edit-invoice')}
              >
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Invoices</p>
                  <p className="text-2xl font-bold text-foreground">{mockInvoices?.length}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-primary" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Paid</p>
                  <p className="text-2xl font-bold text-success">
                    {mockInvoices?.filter(i => i?.status === 'paid')?.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-bold text-warning">
                    {mockInvoices?.filter(i => i?.status === 'pending')?.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-warning" />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-error">
                    {mockInvoices?.filter(i => i?.status === 'overdue')?.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertCircle" size={20} className="text-error" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <InvoiceFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            clientOptions={clientOptions}
            isExpanded={isFiltersExpanded}
            onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedInvoices?.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedInvoices([])}
          />

          {/* Invoice Table */}
          <InvoiceTable
            invoices={paginatedInvoices}
            selectedInvoices={selectedInvoices}
            onSelectionChange={setSelectedInvoices}
            onSort={handleSort}
            sortConfig={sortConfig}
            onInvoiceAction={handleInvoiceAction}
          />

          {/* Pagination */}
          <InvoicePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInvoices?.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </main>
      <QuickActionButton />
      <NotificationBar
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
};

export default InvoiceListPage;