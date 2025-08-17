import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoItemService } from '../../services/demoItemService';
import { demoReceiptService } from '../../services/demoReceiptService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const SimpleBilling = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  
  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    price_inr: '',
    stock_quantity: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data } = await demoItemService.getItems();
    setItems(data || []);
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price_inr * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    const receiptData = {
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone,
      payment_method: 'cash',
      tax_rate: 0,
      discount_amount: 0,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price_inr: item.price_inr
      }))
    };

    const { data: receipt } = await demoReceiptService.createReceipt(receiptData);
    
    if (receipt) {
      // Print receipt immediately
      printReceipt(receipt);
      
      // Clear cart and customer info
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      
      // Reload items to update stock
      loadItems();
      
      alert('Sale completed successfully!');
    }
  };

  const printReceipt = (receipt) => {
    const companyInfo = {
      name: 'Your Store Name',
      address: 'Your Store Address',
      phone: 'Your Phone Number'
    };
    
    const receiptHTML = demoReceiptService.generateReceiptHTML({
      receipt,
      items: receipt.receipt_items || [],
      companyInfo
    });
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const addNewItem = async () => {
    if (!newItem.name || !newItem.price_inr || !newItem.stock_quantity) {
      alert('Please fill all fields');
      return;
    }

    await demoItemService.createItem({
      ...newItem,
      category: 'General',
      is_active: true
    });

    setNewItem({ name: '', price_inr: '', stock_quantity: '' });
    setShowAddItem(false);
    loadItems();
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    item.stock_quantity > 0
  );

  const formatPrice = (price) => `₹${price.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h1 className="text-2xl font-bold text-center text-blue-600">Simple Billing System</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side - Items */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Items</h2>
            <Button 
              onClick={() => setShowAddItem(!showAddItem)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              + Add New Item
            </Button>
          </div>

          {/* Add New Item Form */}
          {showAddItem && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Add New Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <Input
                  placeholder="Price (₹)"
                  type="number"
                  value={newItem.price_inr}
                  onChange={(e) => setNewItem({...newItem, price_inr: e.target.value})}
                />
                <Input
                  placeholder="Stock Quantity"
                  type="number"
                  value={newItem.stock_quantity}
                  onChange={(e) => setNewItem({...newItem, stock_quantity: e.target.value})}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={addNewItem} className="bg-blue-500 text-white">
                  Add Item
                </Button>
                <Button 
                  onClick={() => setShowAddItem(false)}
                  className="bg-gray-500 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Search */}
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {/* Items List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(item.price_inr)} • Stock: {item.stock_quantity}
                  </div>
                </div>
                <Button
                  onClick={() => addToCart(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={item.stock_quantity <= 0}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>

          {/* Customer Info */}
          <div className="mb-4 space-y-2">
            <Input
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              placeholder="Phone Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {/* Cart Items */}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Cart is empty<br />
                Add items from the left side
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(item.price_inr)} × {item.quantity} = {formatPrice(item.price_inr * item.quantity)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-300 hover:bg-gray-400 text-black"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-300 hover:bg-gray-400 text-black"
                    >
                      +
                    </Button>
                    <Button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white ml-2"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total & Checkout */}
          {cart.length > 0 && (
            <div>
              <div className="border-t pt-4">
                <div className="text-xl font-bold text-center mb-4">
                  Total: {formatPrice(calculateTotal())}
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-3"
                >
                  Complete Sale & Print Receipt
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 flex justify-center gap-4 flex-wrap">
        <Button
          onClick={() => navigate('/receipts')}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          View Past Receipts
        </Button>
        <Button
          onClick={() => navigate('/receipt-editor')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          Customize Receipt
        </Button>
        <Button
          onClick={() => navigate('/item-management')}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Advanced Item Management
        </Button>
      </div>
    </div>
  );
};

export default SimpleBilling;
