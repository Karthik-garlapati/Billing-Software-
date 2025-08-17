import React, { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [currentPage, setCurrentPage] = useState('billing');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [salesHistory, setSalesHistory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const getFilteredItems = () => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    setItems([]);
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      setStoreSettings(JSON.parse(savedSettings));
    }
    const savedSalesHistory = localStorage.getItem('salesHistory');
    if (savedSalesHistory) {
      setSalesHistory(JSON.parse(savedSalesHistory));
    } else {
      setSalesHistory([]);
    }
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(c => c.id !== id));
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity } : c));
    }
  };

  const updatePrice = (id, price) => {
    if (price > 0) {
      setCart(cart.map(c => c.id === id ? { ...c, price: parseFloat(price) } : c));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const deleteItem = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== itemId));
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

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

  const saveSettings = () => {
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
    alert('Settings saved successfully!');
  };

  const completeSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    const receipt = generateReceipt();
    printReceipt(receipt);
    const saleData = {
      id: Date.now(),
      date: new Date(),
      customer: customerName || 'Walk-in Customer',
      items: [...cart],
      total: getTotal(),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      receiptHtml: receipt
    };
    const updatedSalesHistory = [...salesHistory, saleData];
    setSalesHistory(updatedSalesHistory);
    localStorage.setItem('salesHistory', JSON.stringify(updatedSalesHistory));
    setCart([]);
    setCustomerName('');
    alert('Sale completed successfully!');
  };

  const generateReceipt = () => {
    const now = new Date();
    let formattedDate;
    if (storeSettings.dateFormat === 'MM/DD/YYYY') {
      formattedDate = now.toLocaleDateString('en-US');
    } else if (storeSettings.dateFormat === 'YYYY-MM-DD') {
      formattedDate = now.toLocaleDateString('en-CA');
    } else {
      formattedDate = now.toLocaleDateString('en-GB');
    }
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

  const viewSavedReceipt = (sale) => {
    if (sale.receiptHtml) {
      printReceipt(sale.receiptHtml);
    } else {
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
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Modern Clean Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', 
        padding: '20px 30px', 
        borderRadius: '16px',
        marginBottom: '25px',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>Simple Store</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '15px' }}>Modern Billing System</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              fontSize: '13px', 
              opacity: 0.9,
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '8px'
            }}>
              {currentDateTime.toLocaleDateString('en-GB')} • {currentDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '2px', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '4px', 
              borderRadius: '12px'
            }}>
              {['billing', 'dashboard', 'settings'].map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{ 
                    backgroundColor: currentPage === page ? 'rgba(255,255,255,0.25)' : 'transparent',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Page */}
      {currentPage === 'billing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          
          {/* Items Panel */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#374151' }}>Items</h2>
              <button 
                onClick={() => setShowAddItem(!showAddItem)}
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px',
                  boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
                }}
              >
                + Add Item
              </button>
            </div>
            
            {/* Search Input */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="🔍 Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>

            {showAddItem && (
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px', fontWeight: '600' }}>Add New Item</h3>
                <input 
                  type="text"
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={addNewItem}
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px'
                    }}
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => setShowAddItem(false)}
                    style={{ 
                      backgroundColor: '#e5e7eb', 
                      color: '#6b7280', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {getFilteredItems().length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '50px 20px', 
                  color: '#9ca3af',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                    {searchTerm ? '🔍' : '📦'}
                  </div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>
                    {searchTerm ? 'No items found' : 'No items yet'}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                    {searchTerm ? 'Try a different search term' : 'Add your first item to get started'}
                  </p>
                </div>
              ) : (
                getFilteredItems().map(item => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    margin: '6px 0',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '15px', color: '#374151' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => addToCart(item)}
                        style={{ 
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '12px'
                        }}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        style={{ 
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        title="Delete Item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Panel */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#374151' }}>Shopping Cart</h2>
            <input 
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                marginBottom: '20px', 
                border: '1px solid #d1d5db', 
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ marginBottom: '20px', maxHeight: '320px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '50px 20px', 
                  color: '#9ca3af',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Cart is empty</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Add items from the left panel</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ 
                    padding: '16px',
                    margin: '6px 0',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: '500', marginBottom: '12px', color: '#374151', fontSize: '15px' }}>
                      {item.name}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updatePrice(item.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '13px',
                            textAlign: 'center',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>
                          Quantity
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              width: '24px', height: '24px',
                              backgroundColor: '#fbbf24',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            style={{
                              width: '40px',
                              padding: '4px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              width: '24px', height: '24px',
                              backgroundColor: '#34d399',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginBottom: '3px', fontWeight: '500' }}>
                          Total
                        </label>
                        <div style={{
                          padding: '6px 8px',
                          backgroundColor: '#d1fae5',
                          borderRadius: '6px',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: '#065f46',
                          fontSize: '13px'
                        }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '20px',
              backgroundColor: '#f9fafb',
              margin: '0 -25px -25px -25px',
              padding: '20px 25px 25px 25px',
              borderRadius: '0 0 16px 16px'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                textAlign: 'center',
                marginBottom: '16px',
                color: '#374151'
              }}>
                Total: ₹{getTotal().toFixed(2)}
              </div>
              
              <button
                onClick={completeSale}
                disabled={cart.length === 0}
                style={{
                  width: '100%',
                  background: cart.length === 0 ? '#e5e7eb' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: cart.length === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: cart.length === 0 ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                {cart.length === 0 ? 'Add items to cart' : 'Complete Sale & Print Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Page */}
      {currentPage === 'settings' && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{ margin: '0 0 30px 0', color: '#374151', textAlign: 'center', fontSize: '24px', fontWeight: '600' }}>Receipt Settings</h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '18px', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              Visibility Options
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
              {[
                { key: 'showStoreName', label: 'Store Name' },
                { key: 'showStoreAddress', label: 'Store Address' },
                { key: 'showStorePhone', label: 'Phone Number' },
                { key: 'showDate', label: 'Date' },
                { key: 'showTime', label: 'Time' },
                { key: 'showCustomer', label: 'Customer Name' },
                { key: 'showTableHeaders', label: 'Table Headers' },
                { key: 'showFooter', label: 'Footer Message' }
              ].map(option => (
                <label key={option.key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: storeSettings[option.key] ? '1px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <input 
                    type="checkbox" 
                    checked={storeSettings[option.key]}
                    onChange={(e) => setStoreSettings({...storeSettings, [option.key]: e.target.checked})}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontWeight: '500', color: '#374151', fontSize: '14px' }}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '18px', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              Store Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { key: 'storeName', label: 'Store Name', placeholder: 'Your Store Name' },
                { key: 'storeAddress', label: 'Store Address', placeholder: 'Your Address' },
                { key: 'storePhone', label: 'Phone Number', placeholder: 'Your Phone' },
                { key: 'footerMessage', label: 'Footer Message', placeholder: 'Thank You, Visit Again!' }
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px', color: '#374151', fontSize: '14px' }}>
                    {field.label}:
                  </label>
                  <input
                    type="text"
                    value={storeSettings[field.key]}
                    onChange={(e) => setStoreSettings({...storeSettings, [field.key]: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={saveSettings}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                padding: '12px 32px', 
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: '0 0 30px 0', color: '#374151', textAlign: 'center', fontSize: '24px', fontWeight: '600' }}>Sales Dashboard</h2>
          {(() => {
            const stats = getDashboardStats();
            const topItems = getTopItems();
            
            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                  {[
                    { title: "Today's Sales", value: stats.todaySales, revenue: stats.todayRevenue, color: '#10b981', bg: '#d1fae5' },
                    { title: "This Week", value: stats.weekSales, revenue: stats.weekRevenue, color: '#f59e0b', bg: '#fef3c7' },
                    { title: "This Month", value: stats.monthSales, revenue: stats.monthRevenue, color: '#3b82f6', bg: '#dbeafe' },
                    { title: "Total Sales", value: stats.totalSales, revenue: stats.totalRevenue, color: '#8b5cf6', bg: '#ede9fe' }
                  ].map((stat, index) => (
                    <div key={index} style={{
                      backgroundColor: stat.bg,
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: `1px solid ${stat.color}30`
                    }}>
                      <h3 style={{ margin: '0 0 12px 0', color: stat.color, fontSize: '14px', fontWeight: '600' }}>{stat.title}</h3>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>₹{stat.revenue.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
                  <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', fontWeight: '600' }}>Quick Stats</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {[
                        { label: 'Total Items Sold', value: stats.totalItems },
                        { label: 'Average Sale', value: `₹${stats.averageSale.toFixed(2)}` },
                        { label: 'Total Transactions', value: salesHistory.length }
                      ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>{item.label}:</span>
                          <strong style={{ color: '#374151', fontSize: '14px' }}>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', fontWeight: '600' }}>Top Selling Items</h3>
                    {topItems.length > 0 ? (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {topItems.map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>{index + 1}. {item.name}</span>
                            <strong style={{ color: '#374151', fontSize: '14px' }}>{item.count} sold</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '16px', fontSize: '14px' }}>No sales data yet</div>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '16px', fontWeight: '600' }}>Recent Sales & Receipts</h3>
                  {salesHistory.length > 0 ? (
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      {salesHistory.slice(-10).reverse().map((sale) => (
                        <div key={sale.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px',
                          marginBottom: '10px',
                          backgroundColor: 'white',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#374151', fontSize: '15px', marginBottom: '3px' }}>{sale.customer}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>
                              {new Date(sale.date).toLocaleDateString()} • {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {sale.itemCount} items • {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '600', color: '#10b981', fontSize: '16px' }}>₹{sale.total.toFixed(2)}</div>
                              <div style={{ fontSize: '10px', color: '#9ca3af' }}>#{sale.id.toString().slice(-6)}</div>
                            </div>
                            <button
                              onClick={() => viewSavedReceipt(sale)}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                              title="View & Print Receipt"
                            >
                              View Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      color: '#9ca3af', 
                      textAlign: 'center', 
                      padding: '50px 20px',
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>No sales data yet</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Complete a sale to see analytics and receipts</p>
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
