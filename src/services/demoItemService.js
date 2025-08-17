// Demo item service that uses localStorage for development/testing
import { sampleItems, sampleCategories } from '../utils/sampleData';

// Initialize localStorage with sample data if empty
const initializeSampleData = () => {
  if (!localStorage.getItem('billtracker_items')) {
    localStorage.setItem('billtracker_items', JSON.stringify(sampleItems));
  }
  if (!localStorage.getItem('billtracker_receipts')) {
    localStorage.setItem('billtracker_receipts', JSON.stringify([]));
  }
};

export const demoItemService = {
  // Get all items
  async getItems(filters = {}) {
    try {
      initializeSampleData();
      
      let items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      
      // Apply filters
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        items = items.filter(item =>
          item?.name?.toLowerCase()?.includes(searchTerm) ||
          item?.description?.toLowerCase()?.includes(searchTerm) ||
          item?.category?.toLowerCase()?.includes(searchTerm) ||
          item?.sku?.toLowerCase()?.includes(searchTerm)
        );
      }
      
      if (filters?.category && filters?.category !== 'all') {
        items = items.filter(item => item?.category === filters?.category);
      }
      
      if (filters?.inStock) {
        items = items.filter(item => item?.stock_quantity > 0);
      }
      
      return { data: items, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  // Get item by ID
  async getItemById(itemId) {
    try {
      const items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      const item = items.find(item => item.id === itemId);
      return { data: item || null, error: item ? null : 'Item not found' };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Create new item
  async createItem(itemData) {
    try {
      const items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      
      const newItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        price_inr: parseFloat(itemData?.price_inr || 0),
        stock_quantity: parseInt(itemData?.stock_quantity || 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      items.push(newItem);
      localStorage.setItem('billtracker_items', JSON.stringify(items));
      
      return { data: newItem, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Update item
  async updateItem(itemId, itemData) {
    try {
      const items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { data: null, error: 'Item not found' };
      }
      
      items[itemIndex] = {
        ...items[itemIndex],
        ...itemData,
        price_inr: parseFloat(itemData?.price_inr || 0),
        stock_quantity: parseInt(itemData?.stock_quantity || 0),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('billtracker_items', JSON.stringify(items));
      
      return { data: items[itemIndex], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Delete item
  async deleteItem(itemId) {
    try {
      const items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      const filteredItems = items.filter(item => item.id !== itemId);
      
      localStorage.setItem('billtracker_items', JSON.stringify(filteredItems));
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get item categories
  async getCategories() {
    try {
      const items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      const categories = [...new Set(items.map(item => item?.category))].filter(Boolean);
      return { data: [...categories, ...sampleCategories.filter(cat => !categories.includes(cat))], error: null };
    } catch (error) {
      return { data: sampleCategories, error: null };
    }
  },

  // Update stock quantity
  async updateStock(itemId, newQuantity) {
    try {
      const items = JSON.parse(localStorage.getItem('billtracker_items') || '[]');
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { data: null, error: 'Item not found' };
      }
      
      items[itemIndex].stock_quantity = parseInt(newQuantity);
      items[itemIndex].updated_at = new Date().toISOString();
      
      localStorage.setItem('billtracker_items', JSON.stringify(items));
      
      return { data: items[itemIndex], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Reduce stock when item is sold
  async reduceStock(itemId, quantitySold) {
    try {
      const { data: item, error: fetchError } = await this.getItemById(itemId);
      if (fetchError || !item) return { data: null, error: fetchError || 'Item not found' };

      const newQuantity = Math.max(0, item.stock_quantity - quantitySold);
      
      return await this.updateStock(itemId, newQuantity);
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};
