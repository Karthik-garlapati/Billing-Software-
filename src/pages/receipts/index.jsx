import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demoReceiptService as receiptService } from '../../services/demoReceiptService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import NotificationBar from '../../components/ui/NotificationBar';
import ReceiptCard from './components/ReceiptCard';
import ReceiptFilters from './components/ReceiptFilters';

const ReceiptsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    dateRange: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Load receipts
  useEffect(() => {
    if (!authLoading && user) {
      loadReceipts();
    }
  }, [user, authLoading, filters]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await receiptService?.getReceipts(filters);
      
      if (error) {
        setError(error?.message || 'Failed to load receipts');
        return;
      }
      
      setReceipts(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (receipt) => {
    const companyInfo = {
      name: 'BillTracker Pro',
      address: 'Your Business Address\nCity, State - PIN Code',
      phone: '+91 98765 43210',
      email: 'info@billtrackerpro.com'
    };
    
    const receiptHTML = receiptService?.generateReceiptHTML({
      receipt,
      items: receipt?.receipt_items || [],
      companyInfo
    });
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev?.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev?.filter(n => n?.id !== notification?.id));
    }, 5000);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Receipts' }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Notifications */}
      <NotificationBar notifications={notifications} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-2xl font-bold text-foreground mt-2">Receipts</h1>
            <p className="text-muted-foreground">View and manage all your sales receipts</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              iconName="Package"
              iconPosition="left"
              onClick={() => navigate('/item-management')}
            >
              Manage Items
            </Button>
            <Button
              iconName="ShoppingCart"
              iconPosition="left"
              onClick={() => navigate('/pos')}
            >
              New Sale
            </Button>
          </div>
        </div>

        {/* Filters */}
        <ReceiptFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          receiptCount={receipts?.length}
        />

        {/* Receipts List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)]?.map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded mb-3"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive text-lg font-medium mb-2">Error Loading Receipts</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadReceipts}>Try Again</Button>
          </div>
        ) : receipts?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg font-medium mb-2">No Receipts Found</div>
            <p className="text-muted-foreground mb-4">
              {filters?.search 
                ? 'No receipts match your search criteria' 
                : 'Start by making your first sale'
              }
            </p>
            <Button iconName="ShoppingCart" onClick={() => navigate('/pos')}>
              Create First Receipt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receipts?.map((receipt) => (
              <ReceiptCard
                key={receipt?.id}
                receipt={receipt}
                onPrint={() => handlePrintReceipt(receipt)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsPage;
