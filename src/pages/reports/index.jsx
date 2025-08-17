import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationBar from '../../components/ui/NotificationBar';
import ReportFilters from './components/ReportFilters';
import RevenueChart from './components/RevenueChart';
import PaymentAnalysis from './components/PaymentAnalysis';
import InvoiceSummary from './components/InvoiceSummary';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const Reports = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});

  const mockUser = {
    name: "Sarah Johnson",
    email: "sarah@billtrackerpro.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
  };

  const handleUserMenuClick = (action) => {
    switch (action) {
      case 'profile': console.log('Navigate to profile');
        break;
      case 'settings': console.log('Navigate to settings');
        break;
      case 'logout': console.log('Logout user');
        break;
      default:
        break;
    }
  };

  const handleNotificationDismiss = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const handleNotificationAction = (notification, actionIndex) => {
    console.log('Notification action:', notification, actionIndex);
  };

  const handleFiltersChange = (filters) => {
    setCurrentFilters(filters);
    console.log('Filters changed:', filters);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleScheduleReport = () => {
    const newNotification = {
      id: Date.now(),
      type: 'success',
      title: 'Report Scheduled',
      message: 'Monthly report has been scheduled for automatic generation.',
      autoHide: true
    };
    setNotifications(prev => [...prev, newNotification]);
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive business insights and financial analytics for informed decision-making
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={handlePrintReport}
                iconName="Printer"
                iconPosition="left"
              >
                Print Report
              </Button>
              <Button
                variant="default"
                onClick={handleScheduleReport}
                iconName="Calendar"
                iconPosition="left"
              >
                Schedule Report
              </Button>
            </div>
          </div>

          {/* Report Filters */}
          <ReportFilters onFiltersChange={handleFiltersChange} />

          {/* Key Performance Indicators */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Icon name="TrendingUp" size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Key Performance Indicators</h2>
            </div>
            <InvoiceSummary />
          </div>

          {/* Revenue Analytics */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Icon name="BarChart3" size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Revenue Analytics</h2>
            </div>
            <RevenueChart />
          </div>

          {/* Payment Analysis */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Icon name="PieChart" size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Payment Analysis</h2>
            </div>
            <PaymentAnalysis />
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats Card */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Icon name="DollarSign" size={20} className="text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Collection Rate</h3>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Collected</span>
                  <span className="text-sm font-medium text-foreground">$114,150</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Outstanding</span>
                  <span className="text-sm font-medium text-warning">$28,450</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '80.1%' }} />
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-success">80.1%</span>
                  <span className="text-sm text-muted-foreground ml-1">collection rate</span>
                </div>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="TrendingUp" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Growth Metrics</h3>
                  <p className="text-sm text-muted-foreground">Year over year</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue Growth</span>
                  <span className="text-sm font-medium text-success">+23.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Client Growth</span>
                  <span className="text-sm font-medium text-success">+18.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Invoice Volume</span>
                  <span className="text-sm font-medium text-success">+15.7%</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="text-center">
                    <span className="text-lg font-bold text-primary">Excellent</span>
                    <p className="text-xs text-muted-foreground">Overall performance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Icon name="Activity" size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">12 invoices paid</p>
                    <p className="text-xs text-muted-foreground">$18,450 collected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">8 new invoices sent</p>
                    <p className="text-xs text-muted-foreground">$12,300 total value</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">3 invoices overdue</p>
                    <p className="text-xs text-muted-foreground">$4,200 outstanding</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">2 new clients added</p>
                    <p className="text-xs text-muted-foreground">Active prospects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Report generated on {new Date()?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {new Date()?.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data reflects real-time invoice and payment status
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Icon name="Shield" size={16} className="text-success" />
                <span className="text-sm text-success">Data Verified</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <QuickActionButton />
      <NotificationBar
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        onAction={handleNotificationAction}
      />
    </div>
  );
};

export default Reports;