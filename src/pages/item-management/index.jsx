import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demoItemService as itemService } from '../../services/demoItemService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import NotificationBar from '../../components/ui/NotificationBar';
import ItemCard from './components/ItemCard';
import AddItemModal from './components/AddItemModal';
import BulkActions from './components/BulkActions';
import ItemFilters from './components/ItemFilters';

const ItemManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    inStock: false,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  // Selection state
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Load items and categories
  useEffect(() => {
    if (!authLoading && user) {
      loadItems();
      loadCategories();
    }
  }, [user, authLoading, filters]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await itemService?.getItems(filters);
      
      if (error) {
        setError(error?.message || 'Failed to load items');
        return;
      }
      
      let sortedItems = data || [];
      
      // Apply sorting
      sortedItems.sort((a, b) => {
        const aVal = a[filters?.sortBy] || '';
        const bVal = b[filters?.sortBy] || '';
        
        if (filters?.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
      
      setItems(sortedItems);
    } catch (err) {
      setError(err?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await itemService?.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await itemService?.deleteItem(itemId);
      
      if (error) {
        addNotification('Failed to delete item', 'error');
        return;
      }
      
      addNotification('Item deleted successfully', 'success');
      loadItems();
    } catch (err) {
      addNotification('Failed to delete item', 'error');
    }
  };

  const handleItemSaved = () => {
    setShowAddModal(false);
    setEditingItem(null);
    loadItems();
    loadCategories();
    addNotification(editingItem ? 'Item updated successfully' : 'Item added successfully', 'success');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleItemSelect = (itemId, isSelected) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev?.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items?.map(item => item?.id));
    }
    setSelectAll(!selectAll);
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
    { label: 'Item Management' }
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
            <h1 className="text-2xl font-bold text-foreground mt-2">Item Management</h1>
            <p className="text-muted-foreground">Manage your inventory items with prices in Indian Rupees</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              iconName="ShoppingCart"
              iconPosition="left"
              onClick={() => navigate('/pos')}
            >
              POS System
            </Button>
            <Button
              iconName="Plus"
              iconPosition="left"
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* Filters */}
        <ItemFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          itemCount={items?.length}
        />

        {/* Bulk Actions */}
        {selectedItems?.length > 0 && (
          <BulkActions
            selectedCount={selectedItems?.length}
            onClearSelection={() => {
              setSelectedItems([]);
              setSelectAll(false);
            }}
            onBulkDelete={async () => {
              if (!confirm(`Are you sure you want to delete ${selectedItems?.length} items?`)) return;
              
              try {
                await Promise.all(selectedItems?.map(id => itemService?.deleteItem(id)));
                addNotification(`${selectedItems?.length} items deleted successfully`, 'success');
                setSelectedItems([]);
                setSelectAll(false);
                loadItems();
              } catch (err) {
                addNotification('Failed to delete some items', 'error');
              }
            }}
          />
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)]?.map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-8 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive text-lg font-medium mb-2">Error Loading Items</div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadItems}>Try Again</Button>
          </div>
        ) : items?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg font-medium mb-2">No Items Found</div>
            <p className="text-muted-foreground mb-4">
              {filters?.search || filters?.category !== 'all' || filters?.inStock 
                ? 'No items match your current filters' 
                : 'Start by adding your first item to the inventory'
              }
            </p>
            <Button iconName="Plus" onClick={handleAddItem}>
              Add First Item
            </Button>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm text-muted-foreground">
                Select All ({items?.length} items)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items?.map((item) => (
                <ItemCard
                  key={item?.id}
                  item={item}
                  isSelected={selectedItems?.includes(item?.id)}
                  onSelect={(isSelected) => handleItemSelect(item?.id, isSelected)}
                  onEdit={() => handleEditItem(item)}
                  onDelete={() => handleDeleteItem(item?.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Add/Edit Item Modal */}
        {showAddModal && (
          <AddItemModal
            item={editingItem}
            categories={categories}
            onClose={() => {
              setShowAddModal(false);
              setEditingItem(null);
            }}
            onSave={handleItemSaved}
          />
        )}
      </div>
    </div>
  );
};

export default ItemManagement;
