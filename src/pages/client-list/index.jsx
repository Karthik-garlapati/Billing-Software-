import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { clientService } from '../../services/clientService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationBar from '../../components/ui/NotificationBar';
import Button from '../../components/ui/Button';
import ClientCard from './components/ClientCard';
import ClientFilters from './components/ClientFilters';
import ClientStats from './components/ClientStats';
import AddClientModal from './components/AddClientModal';
import BulkActions from './components/BulkActions';
import Icon from '../../components/AppIcon';

const ClientList = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  // State management
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState({ status: 'all', balance: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load clients data
  useEffect(() => {
    if (!authLoading && user) {
      loadClients();
    }
  }, [user, authLoading, filterBy]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await clientService?.getClients({
        status: filterBy?.status,
        search: searchQuery
      });

      if (error) {
        throw new Error(error.message);
      }

      setClients(data || []);
    } catch (error) {
      setError(error?.message || 'Failed to load clients');
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Loading Error',
        message: error?.message || 'Failed to load clients. Please refresh and try again.',
        autoHide: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter(client => 
      client?.lastInvoiceDate && new Date(client.lastInvoiceDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    )?.length || 0;
    const totalOutstanding = clients?.reduce((sum, client) => sum + (client?.outstandingBalance || 0), 0) || 0;
    const totalRevenue = clients?.reduce((sum, client) => sum + (client?.totalRevenue || 0), 0) || 0;

    return {
      totalClients,
      activeClients,
      totalOutstanding,
      totalRevenue
    };
  }, [clients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients?.filter(client => {
      // Search filter
      const searchMatch = !searchQuery || 
        client?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        client?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        client?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase());

      // Status filter
      const statusMatch = filterBy?.status === 'all' || client?.status === filterBy?.status;

      // Balance filter
      let balanceMatch = true;
      if (filterBy?.balance !== 'all') {
        const balance = client?.outstandingBalance || 0;
        switch (filterBy?.balance) {
          case 'none':
            balanceMatch = balance === 0;
            break;
          case 'low':
            balanceMatch = balance > 0 && balance < 1000;
            break;
          case 'medium':
            balanceMatch = balance >= 1000 && balance <= 5000;
            break;
          case 'high':
            balanceMatch = balance > 5000;
            break;
        }
      }

      return searchMatch && statusMatch && balanceMatch;
    });

    // Sort clients
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'company':
          return a?.company?.localeCompare(b?.company);
        case 'outstanding':
          return (b?.outstandingBalance || 0) - (a?.outstandingBalance || 0);
        case 'lastActivity':
          return new Date(b?.lastInvoiceDate || 0) - new Date(a?.lastInvoiceDate || 0);
        case 'totalRevenue':
          return (b?.totalRevenue || 0) - (a?.totalRevenue || 0);
        case 'created':
          return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [clients, searchQuery, sortBy, filterBy]);

  // Event handlers
  const handleCreateInvoice = (clientId) => {
    navigate('/create-edit-invoice', { state: { clientId } });
  };

  const handleViewHistory = (clientId) => {
    navigate('/client-profile', { state: { clientId, tab: 'invoices' } });
  };

  const handleEditClient = async (clientId) => {
    const client = clients?.find(c => c?.id === clientId);
    if (client) {
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Edit Client',
        message: `Edit functionality for ${client?.name} would open here.`
      });
    }
  };

  const handleContactClient = (clientId) => {
    const client = clients?.find(c => c?.id === clientId);
    if (client) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Contact Client',
        message: `Email composer for ${client?.name} would open here.`
      });
    }
  };

  const handleAddClient = async (newClientData) => {
    try {
      const { data, error } = await clientService?.createClient(newClientData);
      
      if (error) {
        addNotification({
          id: Date.now(),
          type: 'error',
          title: 'Creation Failed',
          message: error?.message,
          autoHide: false
        });
        return;
      }

      setClients(prev => [data, ...prev]);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Client Added',
        message: `${data?.name} has been successfully added to your client list.`
      });
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Creation Error',
        message: 'Failed to create client. Please try again.',
        autoHide: false
      });
    }
  };

  const handleSelectAll = () => {
    setSelectedClients(filteredAndSortedClients?.map(client => client?.id));
  };

  const handleDeselectAll = () => {
    setSelectedClients([]);
  };

  const handleBulkEmail = () => {
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Bulk Email',
      message: `Email campaign would be sent to ${selectedClients?.length} selected clients.`
    });
    setSelectedClients([]);
  };

  const handleBulkExport = () => {
    addNotification({
      id: Date.now(),
      type: 'success',
      title: 'Export Complete',
      message: `${selectedClients?.length} clients exported to CSV successfully.`
    });
    setSelectedClients([]);
  };

  const handleBulkDelete = () => {
    addNotification({
      id: Date.now(),
      type: 'warning',
      title: 'Bulk Delete',
      message: `${selectedClients?.length} clients would be deleted. This action cannot be undone.`,
      actions: [
        { label: 'Cancel', variant: 'outline' },
        { label: 'Delete', variant: 'destructive' }
      ]
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilterBy({ status: 'all', balance: 'all' });
  };

  const handleUserMenuClick = (action) => {
    switch (action) {
      case 'profile':
        addNotification({
          id: Date.now(),
          type: 'info',
          message: 'Profile settings would open here.'
        });
        break;
      case 'settings':
        addNotification({
          id: Date.now(),
          type: 'info',
          message: 'Application settings would open here.'
        });
        break;
      case 'logout': navigate('/login');
        break;
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
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
                <p className="mt-4 text-muted-foreground">Loading clients...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage your client relationships and track invoice history
              </p>
            </div>
            
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setShowAddModal(true)}
            >
              Add New Client
            </Button>
          </div>

          {/* Stats */}
          <ClientStats stats={stats} />

          {/* Filters */}
          <ClientFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedClients={selectedClients}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            totalClients={filteredAndSortedClients?.length}
          />

          {/* Client Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedClients?.map(client => (
              <ClientCard
                key={client?.id}
                client={client}
                onCreateInvoice={() => handleCreateInvoice(client?.id)}
                onViewHistory={() => handleViewHistory(client?.id)}
                onEditClient={() => handleEditClient(client?.id)}
                onContactClient={() => handleContactClient(client?.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedClients?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery || filterBy?.status !== 'all' || filterBy?.balance !== 'all' ?'No clients match your filters' :'No clients yet'
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterBy?.status !== 'all' || filterBy?.balance !== 'all' ?'Try adjusting your search criteria or filters.' :'Get started by adding your first client to begin tracking invoices.'
                }
              </p>
              {(!searchQuery && filterBy?.status === 'all' && filterBy?.balance === 'all') && (
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Client
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddClient}
      />
      {/* Quick Action Button */}
      <QuickActionButton />
      {/* Notifications */}
      <NotificationBar
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
    </div>
  );
};

export default ClientList;