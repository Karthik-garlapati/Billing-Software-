import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import { clientService } from '../../services/clientService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationBar from '../../components/ui/NotificationBar';
import MetricCard from './components/MetricCard';
import RecentInvoicesTable from './components/RecentInvoicesTable';
import PaymentStatusChart from './components/PaymentStatusChart';
import RevenueChart from './components/RevenueChart';
import QuickActions from './components/QuickActions';
import DateRangeFilter from './components/DateRangeFilter';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    range: '30days'
  });
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    recentInvoices: [],
    paymentData: [],
    revenueData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [user, authLoading, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [invoiceStats, clientStats, recentInvoices] = await Promise.all([
        invoiceService?.getInvoiceStats(),
        clientService?.getClientStats(),
        invoiceService?.getRecentInvoices(5)
      ]);

      if (invoiceStats?.error || clientStats?.error || recentInvoices?.error) {
        throw new Error(invoiceStats?.error?.message || clientStats?.error?.message || recentInvoices?.error?.message || 'Failed to load dashboard data');
      }

      // Prepare metrics
      const metrics = [
        {
          title: "Total Revenue",
          value: `$${invoiceStats?.data?.totalRevenue?.toLocaleString() || '0'}`,
          change: "+12.5%",
          changeType: "positive",
          icon: "DollarSign",
          iconColor: "var(--color-success)",
          trend: true
        },
        {
          title: "Outstanding Balance",
          value: `$${invoiceStats?.data?.outstandingBalance?.toLocaleString() || '0'}`,
          change: "-5.2%",
          changeType: "negative",
          icon: "CreditCard",
          iconColor: "var(--color-warning)",
          trend: true
        },
        {
          title: "Paid Invoices",
          value: invoiceStats?.data?.paidInvoices?.toString() || '0',
          change: "+8.1%",
          changeType: "positive",
          icon: "CheckCircle",
          iconColor: "var(--color-success)",
          trend: false
        },
        {
          title: "Overdue Amount",
          value: `$${invoiceStats?.data?.overdueAmount?.toLocaleString() || '0'}`,
          change: "+15.3%",
          changeType: "negative",
          icon: "AlertCircle",
          iconColor: "var(--color-error)",
          trend: false
        }
      ];

      // Prepare payment status data for chart
      const paymentData = [
        { name: 'paid', value: invoiceStats?.data?.totalRevenue - invoiceStats?.data?.outstandingBalance || 0, count: invoiceStats?.data?.paidInvoices || 0 },
        { name: 'pending', value: invoiceStats?.data?.outstandingBalance - invoiceStats?.data?.overdueAmount || 0, count: (invoiceStats?.data?.totalInvoices - invoiceStats?.data?.paidInvoices) || 0 },
        { name: 'overdue', value: invoiceStats?.data?.overdueAmount || 0, count: 0 },
        { name: 'draft', value: 0, count: 0 }
      ];

      // Prepare revenue trend data
      const revenueData = [
        { period: 'Jan 2024', revenue: 32000, target: 35000 },
        { period: 'Feb 2024', revenue: 28500, target: 35000 },
        { period: 'Mar 2024', revenue: 41200, target: 35000 },
        { period: 'Apr 2024', revenue: 38900, target: 40000 },
        { period: 'May 2024', revenue: 45600, target: 40000 },
        { period: 'Jun 2024', revenue: 42300, target: 40000 },
        { period: 'Jul 2024', revenue: 48200, target: 45000 },
        { period: 'Aug 2024', revenue: invoiceStats?.data?.totalRevenue || 47250, target: 45000 }
      ];

      setDashboardData({
        metrics,
        recentInvoices: recentInvoices?.data || [],
        paymentData,
        revenueData
      });

      // Show notifications for overdue invoices
      if (invoiceStats?.data?.overdueAmount > 0) {
        addNotification({
          id: Date.now(),
          type: 'warning',
          title: 'Overdue Invoices',
          message: `You have overdue invoices totaling $${invoiceStats?.data?.overdueAmount?.toLocaleString()}. Follow up with clients to ensure timely payment.`,
          actions: [
            { label: 'View Overdue', variant: 'default', dismissOnClick: true }
          ]
        });
      }

    } catch (error) {
      setError(error?.message || 'Failed to load dashboard data');
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Dashboard Error',
        message: error?.message || 'Failed to load dashboard data. Please refresh and try again.',
        autoHide: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserMenuClick = (action) => {
    switch (action) {
      case 'profile':
        addNotification({
          id: Date.now(),
          type: 'info',
          title: 'Profile',
          message: 'Profile settings would open here.',
          autoHide: true
        });
        break;
      case 'settings':
        addNotification({
          id: Date.now(),
          type: 'info',
          title: 'Settings',
          message: 'Application settings would open here.',
          autoHide: true
        });
        break;
      case 'logout': navigate('/login');
        break;
      default:
        break;
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoice-list?view=${invoiceId}`);
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      const { data, error } = await invoiceService?.markAsPaid(invoiceId);
      
      if (error) {
        addNotification({
          id: Date.now(),
          type: 'error',
          title: 'Update Failed',
          message: `Failed to update invoice: ${error?.message}`,
          autoHide: false
        });
        return;
      }

      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Invoice Updated',
        message: `Invoice ${data?.invoice_number || invoiceId} has been marked as paid`,
        autoHide: true
      });

      // Reload dashboard data
      loadDashboardData();
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Update Error',
        message: 'Failed to mark invoice as paid. Please try again.',
        autoHide: false
      });
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleNotificationDismiss = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const handleNotificationAction = (notification, actionIndex) => {
    if (notification?.actions?.[actionIndex]?.label === 'View Overdue') {
      navigate('/invoice-list?filter=overdue');
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={userProfile || { name: 'Loading...', email: '' }} onUserMenuClick={handleUserMenuClick} />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={{ name: 'Guest', email: '' }} onUserMenuClick={handleUserMenuClick} />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Authentication Required</p>
                <p className="text-muted-foreground mb-4">Please sign in to access your dashboard.</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={userProfile || { name: user?.email || 'User', email: user?.email || '' }} 
        onUserMenuClick={handleUserMenuClick} 
      />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                  Welcome back, {userProfile?.full_name || user?.email || 'User'}. Here's what's happening with your business today.
                </p>
              </div>
              <div className="mt-4 lg:mt-0">
                <DateRangeFilter 
                  onDateRangeChange={handleDateRangeChange}
                  className="lg:text-right"
                />
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData?.metrics?.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                iconColor={metric?.iconColor}
                trend={metric?.trend}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Invoices - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentInvoicesTable
                invoices={dashboardData?.recentInvoices || []}
                onViewInvoice={handleViewInvoice}
                onMarkPaid={handleMarkPaid}
              />
            </div>
            
            {/* Payment Status Chart - Takes 1 column */}
            <div className="lg:col-span-1">
              <PaymentStatusChart data={dashboardData?.paymentData || []} />
            </div>
          </div>

          {/* Secondary Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RevenueChart data={dashboardData?.revenueData || []} period="month" />
            </div>
            
            {/* Quick Actions - Takes 1 column */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
      {/* Floating Action Button */}
      <QuickActionButton />
      {/* Notifications */}
      <NotificationBar
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        onAction={handleNotificationAction}
        maxVisible={3}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default Dashboard;