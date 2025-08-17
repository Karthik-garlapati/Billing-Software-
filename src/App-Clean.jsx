import React, { useState, useEffect } from 'react';

const App = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', stock: '' });

  // Load sample items on startup
  useEffect(() => {
    const sampleItems = [
      { id: 1, name: 'Rice (1kg)', price: 80, stock: 50 },
      { id: 2, name: 'Wheat (1kg)', price: 45, stock: 30 },
      { id: 3, name: 'Sugar (1kg)', price: 50, stock: 25 },
      { id: 4, name: 'Dal (1kg)', price: 120, stock: 20 },
      { id: 5, name: 'Oil (1L)', price: 150, stock: 15 }
    ];
    setItems(sampleItems);
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
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

  // Calculate total
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Add new item
  const addNewItem = () => {
    if (!newItem.name || !newItem.price || !newItem.stock) {
      alert('Please fill all fields');
      return;
    }
    
    const item = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      stock: parseInt(newItem.stock)
    };
    
    setItems([...items, item]);
    setNewItem({ name: '', price: '', stock: '' });
    setShowAddItem(false);
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
    
    // Update stock
    const updatedItems = items.map(item => {
      const cartItem = cart.find(c => c.id === item.id);
      if (cartItem) {
        return { ...item, stock: item.stock - cartItem.quantity };
      }
      return item;
    });
    setItems(updatedItems);
    
    // Clear cart
    setCart([]);
    setCustomerName('');
    alert('Sale completed successfully!');
  };

  // Generate receipt HTML
  const generateReceipt = () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 2px 0; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center bold">
          YOUR STORE NAME<br>
          Your Address<br>
          Phone: Your Phone<br>
        </div>
        <div class="line"></div>
        <div>Date: ${date} Time: ${time}</div>
        <div>Customer: ${customerName || 'Walk-in Customer'}</div>
        <div class="line"></div>
        <table>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          ${cart.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="right">${item.quantity}</td>
              <td class="right">₹${item.price}</td>
              <td class="right">₹${item.price * item.quantity}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <div class="center bold">TOTAL: ₹${getTotal()}</div>
        <div class="line"></div>
        <div class="center">Thank You, Visit Again!</div>
      </body>
      </html>
    `;
  };

  // Print receipt
  const printReceipt = (receiptHTML) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
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
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>🛍️ Simple Store</h1>
        <p style={{ margin: '5px 0 0 0' }}>Easy Billing System</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Side - Items */}
        <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>📦 Items</h2>
            <button 
              onClick={() => setShowAddItem(!showAddItem)}
              style={{ 
                backgroundColor: '#28A745', 
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
              <input
                type="number"
                placeholder="Price (₹)"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                style={{ width: '48%', padding: '8px', margin: '5px 1%', border: '1px solid #ddd', borderRadius: '3px' }}
              />
              <input
                type="number"
                placeholder="Stock"
                value={newItem.stock}
                onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                style={{ width: '48%', padding: '8px', margin: '5px 1%', border: '1px solid #ddd', borderRadius: '3px' }}
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
                padding: '10px',
                margin: '5px 0',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>₹{item.price} • Stock: {item.stock}</div>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.stock <= 0}
                  style={{ 
                    backgroundColor: item.stock > 0 ? '#28A745' : '#CCC',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: item.stock > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {item.stock > 0 ? 'Add' : 'Out of Stock'}
                </button>
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
              margin: '0 0 20px 0', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
          />

          {/* Cart Items */}
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '50px 0' }}>
                🛒 Cart is empty<br />
                Add items from the left
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ 
                        width: '30px', height: '30px', 
                        backgroundColor: '#FFC107', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ 
                        width: '30px', height: '30px', 
                        backgroundColor: '#28A745', 
                        color: 'white',
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      style={{ 
                        width: '30px', height: '30px', 
                        backgroundColor: '#DC3545', 
                        color: 'white',
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginLeft: '5px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total and Checkout */}
          {cart.length > 0 && (
            <div>
              <div style={{ 
                borderTop: '2px solid #dee2e6', 
                paddingTop: '15px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  color: '#28A745'
                }}>
                  Total: ₹{getTotal()}
                </div>
                <button
                  onClick={completeSale}
                  style={{ 
                    width: '100%',
                    backgroundColor: '#28A745',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    fontSize: '18px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🖨️ Complete Sale & Print Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          Simple Store Billing System • Add items → Select items → Complete sale → Print receipt
        </p>
      </div>
    </div>
  );
};

export default App;
