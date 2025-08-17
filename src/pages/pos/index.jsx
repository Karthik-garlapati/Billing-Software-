import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { demoItemService as itemService } from '../../services/demoItemService';
import { demoReceiptService as receiptService } from '../../services/demoReceiptService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import NotificationBar from '../../components/ui/NotificationBar';
import ItemSelector from './components/ItemSelector';
import CartItems from './components/CartItems';
import PaymentSection from './components/PaymentSection';
import ReceiptPreview from './components/ReceiptPreview';

const POSSystem = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Walk-in Customer',
    phone: '',
    email: ''
  });
  
  // Payment info
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    reference: '',
    taxRate: 0,
    discountAmount: 0
  });
  
  // Modal states
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  
  // Filter for item selector
  const [itemFilter, setItemFilter] = useState('');

  // Load items
  useEffect(() => {
    if (!authLoading && user) {
      loadItems();
    }
  }, [user, authLoading]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await itemService?.getItems({ inStock: true });
      
      if (error) {
        setError(error?.message || 'Failed to load items');
        return;
      }
      
      setItems(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingIndex = cartItems?.findIndex(cartItem => cartItem?.id === item?.id);
    
    if (existingIndex >= 0) {
      // Update quantity if item already in cart
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      // Add new item to cart
      setCartItems(prev => [...prev, {
        ...item,
        quantity: 1,
        cartId: Date.now() // Unique ID for cart item
      }]);
    }
    
    addNotification(`${item?.name} added to cart`, 'success');
  };

  const updateCartItemQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    
    setCartItems(prev => prev?.map(item => 
      item?.cartId === cartId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev?.filter(item => item?.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerInfo({ name: 'Walk-in Customer', phone: '', email: '' });
    setPaymentInfo({ method: 'cash', reference: '', taxRate: 0, discountAmount: 0 });
  };

  const calculateTotals = () => {
    const subtotal = cartItems?.reduce((sum, item) => sum + (item?.quantity * item?.price_inr), 0);
    const discountAmount = paymentInfo?.discountAmount || 0;
    const taxAmount = (subtotal - discountAmount) * (paymentInfo?.taxRate || 0) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleCheckout = async () => {
    if (cartItems?.length === 0) {
      addNotification('Cart is empty', 'error');
      return;
    }
    
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();
    
    try {
      const receiptData = {
        receipt_number: receiptService?.generateReceiptNumber(),
        customer_name: customerInfo?.name || 'Walk-in Customer',
        customer_phone: customerInfo?.phone,
        customer_email: customerInfo?.email,
        subtotal,
        tax_rate: paymentInfo?.taxRate,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        payment_method: paymentInfo?.method,
        payment_reference: paymentInfo?.reference,
        notes: '',
        items: cartItems?.map(item => ({
          id: item?.id,
          name: item?.name,
          quantity: item?.quantity,
          price_inr: item?.price_inr
        }))
      };
      
      const { data: receipt, error } = await receiptService?.createReceipt(receiptData);
      
      if (error) {
        addNotification('Failed to create receipt', 'error');
        return;
      }
      
      setLastReceipt(receipt);
      setShowReceiptPreview(true);
      clearCart();
      loadItems(); // Refresh items to update stock
      addNotification('Receipt created successfully', 'success');
      
    } catch (err) {
      addNotification('Failed to process checkout', 'error');
    }
  };

  const printReceipt = (receipt) => {
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

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'POS System' }
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
            <h1 className="text-2xl font-bold text-foreground mt-2">POS System</h1>
            <p className="text-muted-foreground">Point of Sale system with receipt printing</p>
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
              variant="outline"
              iconName="Receipt"
              iconPosition="left"
              onClick={() => navigate('/receipts')}
            >
              View Receipts
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Item Selection */}
          <div className="lg:col-span-2">
            <ItemSelector
              items={items}
              loading={loading}
              error={error}
              filter={itemFilter}
              onFilterChange={setItemFilter}
              onAddToCart={addToCart}
              onRetry={loadItems}
            />
          </div>
          
          {/* Right Side - Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart Items */}
            <CartItems
              items={cartItems}
              onUpdateQuantity={updateCartItemQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
            />
            
            {/* Customer Info */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Customer Information</h3>
              <div className="space-y-3">
                <Input
                  label="Customer Name"
                  value={customerInfo?.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Walk-in Customer"
                />
                <Input
                  label="Phone Number"
                  value={customerInfo?.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            
            {/* Payment Section */}
            <PaymentSection
              paymentInfo={paymentInfo}
              onPaymentInfoChange={setPaymentInfo}
              subtotal={subtotal}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              total={total}
            />
            
            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full"
              iconName="CreditCard"
              iconPosition="left"
              onClick={handleCheckout}
              disabled={cartItems?.length === 0}
            >
              Checkout - {receiptService?.formatINR(total)}
            </Button>
          </div>
        </div>

        {/* Receipt Preview Modal */}
        {showReceiptPreview && lastReceipt && (
          <ReceiptPreview
            receipt={lastReceipt}
            onClose={() => setShowReceiptPreview(false)}
            onPrint={() => printReceipt(lastReceipt)}
          />
        )}
      </div>
    </div>
  );
};

export default POSSystem;
