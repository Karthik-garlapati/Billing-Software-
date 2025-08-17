import React, { useState } from 'react';
import { demoItemService as itemService } from '../../../services/demoItemService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddItemModal = ({ item, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    price_inr: item?.price_inr || '',
    stock_quantity: item?.stock_quantity || '',
    sku: item?.sku || '',
    barcode: item?.barcode || '',
    image_url: item?.image_url || '',
    is_active: item?.is_active ?? true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (item?.id) {
        // Update existing item
        const { error } = await itemService?.updateItem(item?.id, formData);
        if (error) throw new Error(error?.message || 'Failed to update item');
      } else {
        // Create new item
        const { error } = await itemService?.createItem(formData);
        if (error) throw new Error(error?.message || 'Failed to create item');
      }
      
      onSave();
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    ...categories?.map(cat => ({ value: cat, label: cat })),
    { value: 'new', label: '+ Add New Category' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            className="p-2"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Name *"
              value={formData?.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter item name"
              required
            />
            
            <Input
              label="SKU"
              value={formData?.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              placeholder="Stock Keeping Unit"
            />
          </div>
          
          <Input
            label="Description"
            value={formData?.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Item description"
            multiline
            rows={3}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Category"
                value={formData?.category}
                onChange={(value) => {
                  if (value === 'new') {
                    const newCategory = prompt('Enter new category name:');
                    if (newCategory) {
                      handleChange('category', newCategory);
                    }
                  } else {
                    handleChange('category', value);
                  }
                }}
                options={categoryOptions}
              />
            </div>
            
            <Input
              label="Price (₹) *"
              type="number"
              step="0.01"
              min="0"
              value={formData?.price_inr}
              onChange={(e) => handleChange('price_inr', e.target.value)}
              placeholder="0.00"
              required
            />
            
            <Input
              label="Stock Quantity *"
              type="number"
              min="0"
              value={formData?.stock_quantity}
              onChange={(e) => handleChange('stock_quantity', e.target.value)}
              placeholder="0"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Barcode"
              value={formData?.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
              placeholder="Barcode number"
            />
            
            <Input
              label="Image URL"
              value={formData?.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData?.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="is_active" className="text-sm text-foreground">
              Item is active and available for sale
            </label>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              iconName={item ? "Save" : "Plus"}
              iconPosition="left"
            >
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
