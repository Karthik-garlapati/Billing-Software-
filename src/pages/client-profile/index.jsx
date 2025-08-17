import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationBar from '../../components/ui/NotificationBar';
import ClientHeader from './components/ClientHeader';
import ClientTabs from './components/ClientTabs';
import OverviewTab from './components/OverviewTab';
import InvoiceHistoryTab from './components/InvoiceHistoryTab';
import CommunicationTab from './components/CommunicationTab';

const ClientProfile = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams?.get('id') || '1';
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [client, setClient] = useState({
    id: '1',
    name: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john.smith@acmecorp.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    createdAt: '2024-04-01',
    totalInvoiced: 15200.00,
    amountPaid: 12000.00,
    outstanding: 3200.00,
    avgPaymentTime: 18,
    address: {
      street: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    paymentTerms: 'net30',
    taxRate: 8.25,
    notes: `Acme Corporation is one of our most reliable clients. They typically pay within 15-20 days despite having Net 30 terms. \n\nKey contacts:\n- John Smith (Primary)\n- Sarah Johnson (Accounting)\n\nPreferred communication method: Email\nBest time to contact: 9 AM - 5 PM EST`,
    tags: ['VIP Client', 'Technology', 'Recurring']
  });

  const user = {
    name: 'Sarah Johnson',
    email: 'sarah@billtrackerpro.com'
  };

  useEffect(() => {
    // Simulate loading client data based on ID
    if (clientId !== '1') {
      // In a real app, fetch client data from API
      console.log('Loading client data for ID:', clientId);
    }
  }, [clientId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedClient) => {
    setClient(updatedClient);
    setIsEditing(false);
    
    // Show success notification
    const successNotification = {
      id: Date.now(),
      type: 'success',
      title: 'Client Updated',
      message: 'Client information has been saved successfully.',
      autoHide: true
    };
    
    setNotifications(prev => [...prev, successNotification]);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleClientUpdate = (updatedClient) => {
    setClient(updatedClient);
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

  const breadcrumbItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      label: 'Clients',
      path: '/client-list',
      icon: 'Users'
    },
    {
      label: client?.name,
      path: '/client-profile',
      icon: 'User',
      current: true
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            client={client}
            isEditing={isEditing}
            onClientUpdate={handleClientUpdate}
          />
        );
      case 'invoices':
        return <InvoiceHistoryTab clientId={client?.id} />;
      case 'communication':
        return <CommunicationTab clientId={client?.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onUserMenuClick={handleUserMenuClick} />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb customItems={breadcrumbItems} />
          
          <ClientHeader
            client={client}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={isEditing}
          />
          
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6 pb-0">
              <ClientTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
            
            <div className="p-6">
              {renderTabContent()}
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

export default ClientProfile;