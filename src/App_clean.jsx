import React, { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [currentPage, setCurrentPage] = useState('billing'); // 'billing', 'dashboard', 'settings'
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [salesHistory, setSalesHistory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '' });
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'YOUR STORE NAME',
    storeAddress: 'Your Address',
    storePhone: 'Your Phone',
    footerMessage: 'Thank You, Visit Again!',
    dateLabel: 'Date:',
    timeLabel: 'Time:',
    customerLabel: 'Customer:',
    snoLabel: 'S.No.',
    itemLabel: 'Item',
    qtyLabel: 'Qty',
    priceLabel: 'Price',
    totalLabel: 'Total',
    grandTotalLabel: 'TOTAL:',
    walkInCustomer: 'Walk-in Customer',
    showStoreName: true,
    showStoreAddress: true,
    showStorePhone: true,
    showDate: true,
    showTime: true,
    showCustomer: true,
    showTableHeaders: true,
    showFooter: true,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24hour'
  });

  // Load sample items on startup
  useEffect(() => {
    // Start with empty items list - no default items
    setItems([]);

    // Load saved store settings
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      setStoreSettings(JSON.parse(savedSettings));
    }

    // Load sales history
    const savedSalesHistory = localStorage.getItem('salesHistory');
    if (savedSalesHistory) {
      setSalesHistory(JSON.parse(savedSalesHistory));
    } else {
      // Start with empty sales history - no default sales
      setSalesHistory([]);
    }

    // Update current date/time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, price: 0, quantity: 1 }]);
    }
  };

  // Update cart quantity
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(c => c.id !== id));
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity } : c));
    }
  };

  // Update cart price
  const updatePrice = (id, price) => {
    if (price > 0) {
      setCart(cart.map(c => c.id === id ? { ...c, price: parseFloat(price) } : c));
    }
  };

  // Calculate total
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Delete item from items list
  const deleteItem = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== itemId));
      // Also remove from cart if present
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  // Add new item
  const addNewItem = () => {
    if (!newItem.name) {
      alert('Please enter item name');
      return;
    }
    
    const item = {
      id: Date.now(),
      name: newItem.name
    };
    
    setItems([...items, item]);
    setNewItem({ name: '' });
    setShowAddItem(false);
  };

  // Save store settings
  const saveSettings = () => {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
    alert('Settings saved successfully!');
  };

  // Complete sale and print receipt
  const completeSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Generate receipt
    const receipt = generateReceipt();
    printReceipt(receipt);
    
    // Save sale to history for dashboard
    const saleData = {
      id: Date.now(),
      date: new Date(),
      customer: customerName || 'Walk-in Customer',
      items: [...cart],
      total: getTotal(),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      receiptHtml: receipt // Save the full receipt HTML
    };
    
    const updatedSalesHistory = [...salesHistory, saleData];
    setSalesHistory(updatedSalesHistory);
    localStorage.setItem('salesHistory', JSON.stringify(updatedSalesHistory));
    
    // Clear cart
    setCart([]);
    setCustomerName('');
    alert('Sale completed successfully!');
  };

  // Generate receipt HTML
  const generateReceipt = () => {
    const now = new Date();
    
    // Format date based on user preference
    let formattedDate;
    if (storeSettings.dateFormat === 'MM/DD/YYYY') {
      formattedDate = now.toLocaleDateString('en-US');
    } else if (storeSettings.dateFormat === 'YYYY-MM-DD') {
      formattedDate = now.toLocaleDateString('en-CA');
    } else {
      formattedDate = now.toLocaleDateString('en-GB');
    }
    
    // Format time based on user preference
    const formattedTime = storeSettings.timeFormat === '12hour' 
      ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return `
      <div style="font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px;">
        ${storeSettings.showStoreName || storeSettings.showStoreAddress || storeSettings.showStorePhone ? `
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            ${storeSettings.showStoreName ? `<h2 style="margin: 0;">${storeSettings.storeName}</h2>` : ''}
            ${storeSettings.showStoreAddress ? `<div>${storeSettings.storeAddress}</div>` : ''}
            ${storeSettings.showStorePhone ? `<div>${storeSettings.storePhone}</div>` : ''}
          </div>
        ` : ''}
        
        <div style="margin-bottom: 15px;">
          ${storeSettings.showDate ? `<div>${storeSettings.dateLabel} ${formattedDate}</div>` : ''}
          ${storeSettings.showTime ? `<div>${storeSettings.timeLabel} ${formattedTime}</div>` : ''}
          ${storeSettings.showCustomer ? `<div>${storeSettings.customerLabel} ${customerName || storeSettings.walkInCustomer}</div>` : ''}
        </div>
        
        ${storeSettings.showTableHeaders ? `
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th class="center-col" style="text-align: center; padding: 5px;">${storeSettings.snoLabel}</th>
                <th style="text-align: left; padding: 5px;">${storeSettings.itemLabel}</th>
                <th style="text-align: center; padding: 5px;">${storeSettings.qtyLabel}</th>
                <th style="text-align: right; padding: 5px;">${storeSettings.priceLabel}</th>
                <th style="text-align: right; padding: 5px;">${storeSettings.totalLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map((item, index) => `
                <tr>
                  <td class="center-col" style="text-align: center; padding: 3px;">${index + 1}</td>
                  <td style="padding: 3px;">${item.name}</td>
                  <td style="text-align: center; padding: 3px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 3px;">₹${item.price}</td>
                  <td style="text-align: right; padding: 3px;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div style="margin-bottom: 15px;">
            ${cart.map((item, index) => `
              <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                <span>${index + 1}. ${item.name} x ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        `}
        
        <div style="border-top: 2px solid #000; padding-top: 10px; text-align: right;">
          <strong>${storeSettings.grandTotalLabel} ₹${getTotal().toFixed(2)}</strong>
        </div>
        
        ${storeSettings.showFooter ? `
          <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #000;">
            ${storeSettings.footerMessage}
          </div>
        ` : ''}
      </div>
    `;
  };

  // Print receipt
  const printReceipt = (receiptHtml) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { margin: 0; }
            .center-col { text-align: center; }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Dashboard Analytics Functions
  const getDashboardStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisWeekStart = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaySales = salesHistory.filter(sale => new Date(sale.date) >= todayStart);
    const weekSales = salesHistory.filter(sale => new Date(sale.date) >= thisWeekStart);
    const monthSales = salesHistory.filter(sale => new Date(sale.date) >= thisMonthStart);

    return {
      totalSales: salesHistory.length,
      totalRevenue: salesHistory.reduce((sum, sale) => sum + sale.total, 0),
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.total, 0),
      weekSales: weekSales.length,
      weekRevenue: weekSales.reduce((sum, sale) => sum + sale.total, 0),
      monthSales: monthSales.length,
      monthRevenue: monthSales.reduce((sum, sale) => sum + sale.total, 0),
      totalItems: salesHistory.reduce((sum, sale) => sum + sale.itemCount, 0),
      averageSale: salesHistory.length > 0 ? salesHistory.reduce((sum, sale) => sum + sale.total, 0) / salesHistory.length : 0
    };
  };

  const getTopItems = () => {
    const itemCount = {};
    salesHistory.forEach(sale => {
      sale.items.forEach(item => {
        if (itemCount[item.name]) {
          itemCount[item.name] += item.quantity;
        } else {
          itemCount[item.name] = item.quantity;
        }
      });
    });
    
    return Object.entries(itemCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  // View/Reprint saved receipt
  const viewSavedReceipt = (sale) => {
    if (sale.receiptHtml) {
      // Use the saved receipt HTML
      printReceipt(sale.receiptHtml);
    } else {
      // Generate receipt from sale data (for backwards compatibility)
      const receiptHtml = `
        <div style="font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
            <h2 style="margin: 0;">${storeSettings.storeName}</h2>
            <div>${storeSettings.storeAddress}</div>
            <div>${storeSettings.storePhone}</div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div>Date: ${new Date(sale.date).toLocaleDateString()}</div>
            <div>Time: ${new Date(sale.date).toLocaleTimeString()}</div>
            <div>Customer: ${sale.customer}</div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th style="text-align: left; padding: 5px;">Item</th>
                <th style="text-align: center; padding: 5px;">Qty</th>
                <th style="text-align: right; padding: 5px;">Price</th>
                <th style="text-align: right; padding: 5px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td style="padding: 3px;">${item.name}</td>
                  <td style="text-align: center; padding: 3px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 3px;">₹${item.price}</td>
                  <td style="text-align: right; padding: 3px;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="border-top: 2px solid #000; padding-top: 10px; text-align: right;">
            <strong>TOTAL: ₹${sale.total.toFixed(2)}</strong>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #000;">
            ${storeSettings.footerMessage}
          </div>
        </div>
      `;
      printReceipt(receiptHtml);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        backgroundColor: '#4A90E2', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>🛍️ Simple Store</h1>
          <p style={{ margin: '5px 0 0 0' }}>Easy Billing System</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.9 }}>
            {currentDateTime.toLocaleDateString('en-GB')} • {currentDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setCurrentPage('billing')}
              style={{ 
                backgroundColor: currentPage === 'billing' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '1px solid white', 
                padding: '10px 15px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: currentPage === 'billing' ? 'bold' : 'normal'
              }}
            >
              🛍️ Billing
            </button>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              style={{ 
                backgroundColor: currentPage === 'dashboard' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '1px solid white', 
                padding: '10px 15px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: currentPage === 'dashboard' ? 'bold' : 'normal'
              }}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('settings')}
              style={{ 
                backgroundColor: currentPage === 'settings' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '1px solid white', 
                padding: '10px 15px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: currentPage === 'settings' ? 'bold' : 'normal'
              }}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Billing Page */}
      {currentPage === 'billing' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left Side - Items */}
            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>📦 Items</h2>
                <button 
                  onClick={() => setShowAddItem(!showAddItem)}
                  style={{ 
                    backgroundColor: '#007BFF', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 15px', 
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Item
                </button>
              </div>

              {/* Add New Item Form */}
              {showAddItem && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                  <h3>Add New Item</h3>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '3px' }}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      onClick={addNewItem}
                      style={{ backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '3px', marginRight: '10px', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => setShowAddItem(false)}
                      style={{ backgroundColor: '#6C757D', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {items.map(item => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '15px',
                    margin: '5px 0',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', flex: 1 }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => addToCart(item)}
                        style={{ 
                          backgroundColor: '#28A745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        style={{ 
                          backgroundColor: '#DC3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}
                        title="Delete Item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Cart */}
            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '20px' }}>
              <h2 style={{ margin: '0 0 20px 0' }}>🛒 Cart</h2>

              {/* Customer Name */}
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginBottom: '20px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
              />

              {/* Cart Items */}
              <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                {cart.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px', 
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px'
                  }}>
                    🛒 Cart is empty<br />
                    Add items from the left
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} style={{ 
                      padding: '15px',
                      margin: '5px 0',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                        {item.name}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                        {/* Price Section */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updatePrice(item.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '14px',
                              textAlign: 'center'
                            }}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        {/* Quantity Section */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                            Quantity
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{ 
                                width: '25px', height: '25px', 
                                backgroundColor: '#FFC107', 
                                border: 'none', 
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              style={{
                                width: '50px',
                                padding: '4px',
                                border: '1px solid #ddd',
                                borderRadius: '3px',
                                textAlign: 'center',
                                fontSize: '14px'
                              }}
                              min="1"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{ 
                                width: '25px', height: '25px', 
                                backgroundColor: '#28A745', 
                                color: 'white',
                                border: 'none', 
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total Section */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>
                            Total
                          </label>
                          <div style={{ 
                            padding: '6px',
                            backgroundColor: '#e8f5e8',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: '#28A745'
                          }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <button
                          onClick={() => updateQuantity(item.id, 0)}
                          style={{ 
                            backgroundColor: '#DC3545', 
                            color: 'white',
                            border: 'none', 
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove Item
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total and Checkout */}
              <div style={{ borderTop: '2px solid #ddd', paddingTop: '20px' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  marginBottom: '20px',
                  color: '#28A745'
                }}>
                  Total: ₹{getTotal().toFixed(2)}
                </div>
                
                <button
                  onClick={completeSale}
                  disabled={cart.length === 0}
                  style={{ 
                    width: '100%',
                    backgroundColor: cart.length === 0 ? '#CCC' : '#28A745',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '5px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {cart.length === 0 ? 'Add items to cart' : '🖨️ Complete Sale & Print'}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <p style={{ margin: 0, color: '#666' }}>
              Simple Store Billing System • Add items → Select items → Complete sale → Print receipt
            </p>
          </div>
        </div>
      )}

      {/* Settings Page */}
      {currentPage === 'settings' && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #4A90E2', 
          borderRadius: '10px', 
          padding: '30px'
        }}>
          <h2 style={{ margin: '0 0 30px 0', color: '#4A90E2', textAlign: 'center' }}>⚙️ Complete Receipt Customization</h2>
          
          {/* Show/Hide Options Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#6610F2', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              👁️ Show/Hide Receipt Elements
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showStoreName}
                  onChange={(e) => setStoreSettings({...storeSettings, showStoreName: e.target.checked})}
                />
                Store Name
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showStoreAddress}
                  onChange={(e) => setStoreSettings({...storeSettings, showStoreAddress: e.target.checked})}
                />
                Store Address
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showStorePhone}
                  onChange={(e) => setStoreSettings({...storeSettings, showStorePhone: e.target.checked})}
                />
                Phone Number
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showDate}
                  onChange={(e) => setStoreSettings({...storeSettings, showDate: e.target.checked})}
                />
                Date
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showTime}
                  onChange={(e) => setStoreSettings({...storeSettings, showTime: e.target.checked})}
                />
                Time
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showCustomer}
                  onChange={(e) => setStoreSettings({...storeSettings, showCustomer: e.target.checked})}
                />
                Customer Name
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showTableHeaders}
                  onChange={(e) => setStoreSettings({...storeSettings, showTableHeaders: e.target.checked})}
                />
                Table Headers
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={storeSettings.showFooter}
                  onChange={(e) => setStoreSettings({...storeSettings, showFooter: e.target.checked})}
                />
                Footer Message
              </label>
            </div>
          </div>

          {/* Store Information Section */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#6610F2', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              🏪 Store Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Store Name:
                </label>
                <input
                  type="text"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '3px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your Store Name"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Store Address:
                </label>
                <input
                  type="text"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({...storeSettings, storeAddress: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '3px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your Address"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Phone Number:
                </label>
                <input
                  type="text"
                  value={storeSettings.storePhone}
                  onChange={(e) => setStoreSettings({...storeSettings, storePhone: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '3px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your Phone"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Footer Message:
                </label>
                <input
                  type="text"
                  value={storeSettings.footerMessage}
                  onChange={(e) => setStoreSettings({...storeSettings, footerMessage: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '3px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Thank You, Visit Again!"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={saveSettings}
              style={{ 
                backgroundColor: '#28A745', 
                color: 'white', 
                border: 'none', 
                padding: '12px 25px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              💾 Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #4A90E2', 
          borderRadius: '10px', 
          padding: '30px'
        }}>
          <h2 style={{ margin: '0 0 30px 0', color: '#4A90E2', textAlign: 'center' }}>📊 Sales Dashboard & Analytics</h2>

          {(() => {
            const stats = getDashboardStats();
            const topItems = getTopItems();
            
            return (
              <div>
                {/* Key Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ backgroundColor: '#E8F5E8', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#28A745' }}>Today's Sales</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28A745' }}>{stats.todaySales}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>₹{stats.todayRevenue.toFixed(2)}</div>
                  </div>
                  
                  <div style={{ backgroundColor: '#FFF3CD', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#FFC107' }}>This Week</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFC107' }}>{stats.weekSales}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>₹{stats.weekRevenue.toFixed(2)}</div>
                  </div>
                  
                  <div style={{ backgroundColor: '#D1ECF1', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#17A2B8' }}>This Month</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17A2B8' }}>{stats.monthSales}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>₹{stats.monthRevenue.toFixed(2)}</div>
                  </div>
                  
                  <div style={{ backgroundColor: '#F8D7DA', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#DC3545' }}>Total Sales</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC3545' }}>{stats.totalSales}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>₹{stats.totalRevenue.toFixed(2)}</div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ backgroundColor: '#F8F9FA', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Quick Stats</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Items Sold:</span>
                        <strong>{stats.totalItems}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Average Sale:</span>
                        <strong>₹{stats.averageSale.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Sales Database:</span>
                        <strong>{salesHistory.length} transactions</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#F8F9FA', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🏆 Top Selling Items</h3>
                    {topItems.length > 0 ? (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {topItems.map((item, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                            <span>{index + 1}. {item.name}</span>
                            <strong>{item.count} sold</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#666', fontStyle: 'italic' }}>No sales data yet</div>
                    )}
                  </div>
                </div>

                {/* Recent Sales */}
                <div style={{ backgroundColor: '#F8F9FA', padding: '20px', borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🕒 Recent Sales & Receipts</h3>
                  {salesHistory.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {salesHistory.slice(-10).reverse().map((sale) => (
                        <div key={sale.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '12px', 
                          marginBottom: '8px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>{sale.customer}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              📅 {new Date(sale.date).toLocaleDateString()} • 🕐 {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              📦 {sale.itemCount} items • 🛒 {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', color: '#28A745', fontSize: '16px' }}>₹{sale.total.toFixed(2)}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Sale #{sale.id.toString().slice(-6)}</div>
                            </div>
                            <button
                              onClick={() => viewSavedReceipt(sale)}
                              style={{
                                backgroundColor: '#007BFF',
                                color: 'white',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                              title="View & Print Receipt"
                            >
                              🧾 Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#666', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                      📝 No sales data yet. Complete a sale to see analytics and saved receipts!
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default App;
