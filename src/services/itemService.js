import { supabase } from '../lib/supabase';

export const itemService = {
  // Get all items for current user
  async getItems(filters = {}) {
    try {
      let query = supabase?.from('items')?.select('*')?.order('created_at', { ascending: false });

      if (filters?.search) {
        query = query?.or(`name.ilike.%${filters?.search}%,description.ilike.%${filters?.search}%,category.ilike.%${filters?.search}%`);
      }

      if (filters?.category && filters?.category !== 'all') {
        query = query?.eq('category', filters?.category);
      }

      if (filters?.inStock) {
        query = query?.gt('stock_quantity', 0);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get item by ID
  async getItemById(itemId) {
    try {
      const { data, error } = await supabase?.from('items')?.select('*')?.eq('id', itemId)?.single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new item
  async createItem(itemData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      const newItem = {
        ...itemData,
        user_id: user?.id,
        price_inr: parseFloat(itemData?.price_inr || 0),
        stock_quantity: parseInt(itemData?.stock_quantity || 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase?.from('items')?.insert([newItem])?.select()?.single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update item
  async updateItem(itemId, itemData) {
    try {
      const updateData = {
        ...itemData,
        price_inr: parseFloat(itemData?.price_inr || 0),
        stock_quantity: parseInt(itemData?.stock_quantity || 0),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase?.from('items')?.update(updateData)?.eq('id', itemId)?.select()?.single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete item
  async deleteItem(itemId) {
    try {
      const { error } = await supabase?.from('items')?.delete()?.eq('id', itemId);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get item categories
  async getCategories() {
    try {
      const { data, error } = await supabase?.from('items')?.select('category')?.not('category', 'is', null);
      
      if (error) return { data: [], error };
      
      const categories = [...new Set(data?.map(item => item?.category))].filter(Boolean);
      return { data: categories, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Update stock quantity
  async updateStock(itemId, newQuantity) {
    try {
      const { data, error } = await supabase?.from('items')
        ?.update({ 
          stock_quantity: parseInt(newQuantity),
          updated_at: new Date().toISOString()
        })
        ?.eq('id', itemId)
        ?.select()
        ?.single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reduce stock when item is sold
  async reduceStock(itemId, quantitySold) {
    try {
      // First get current stock
      const { data: item, error: fetchError } = await this.getItemById(itemId);
      if (fetchError || !item) return { data: null, error: fetchError || 'Item not found' };

      const newQuantity = Math.max(0, item.stock_quantity - quantitySold);
      
      return await this.updateStock(itemId, newQuantity);
    } catch (error) {
      return { data: null, error };
    }
  }
};
