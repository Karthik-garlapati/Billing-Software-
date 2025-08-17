// Clean single implementation of the App component (corrupted duplicate removed)
import React, { useState, useEffect } from 'react';
import { loadInitialData, saveSale, saveSettingsData, syncPendingSales } from './services/dataRepository';
import NotificationBar from './components/ui/NotificationBar';

function App() {
  // State
  const [items, setItems] = useState([]); // Persisted to localStorage (key: appItems)
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('billing');
  // Remove global clock-driven rerenders; isolated component handles time updates
  const [salesHistory, setSalesHistory] = useState([]);
  const [storeSettings, setStoreSettings] = useState(() => ({
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
  }));
  const [notifications, setNotifications] = useState([]);

  const pushNotification = (notif) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [{ id, autoHide: true, ...notif }, ...prev].slice(0,6));
  };
  const dismissNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  // Effects
  useEffect(() => {
    // Load settings + sales from repository (remote + local fallback)
    // Load items from localStorage first
    try {
      const storedItems = localStorage.getItem('appItems');
      if (storedItems) setItems(JSON.parse(storedItems));
    } catch (e) { /* ignore */ }

    loadInitialData().then(({ settings, sales }) => {
      setStoreSettings(settings);
      setSalesHistory(sales);
      pushNotification({ type:'info', title:'Data Loaded', message:`Loaded ${sales.length} sales records` });
      // Attempt sync of any pending offline sales (fire & forget)
      syncPendingSales().then(res => {
        if (res.synced) pushNotification({ type:'success', title:'Synced', message:`Synced ${res.synced} pending sale(s)` });
      });
    });
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleOnline = () => {
    syncPendingSales().then(res => {
      if (res.synced) pushNotification({ type:'success', title:'Online Sync', message:`Synced ${res.synced} pending sale(s)` });
    });
  };

  // Helpers
  const getFilteredItems = () => items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const getTotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Item & Cart Ops
  const addNewItem = () => {
    if (!newItem.name.trim()) return alert('Enter item name');
    setItems(prev => {
      const updated = [...prev, { id: Date.now(), name: newItem.name.trim() }];
      localStorage.setItem('appItems', JSON.stringify(updated));
      return updated;
    });
    setNewItem({ name: '' });
    setShowAddItem(false);
    pushNotification({ type:'success', title:'Item Added', message:`${newItem.name.trim()} added` });
  };
  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(p => p.id === item.id);
      if (ex) return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1, quantityInput: String(p.quantity + 1) } : p);
      return [...prev, { ...item, price: 0, quantity: 1, priceInput: '0', quantityInput: '1' }];
    });
  };
  const updateQuantity = (id, raw) => {
    const pattern = /^\d*$/; // allow only digits but any length
    setCart(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (raw === '') return { ...p, quantityInput: '', quantity: 0 };
      if (!pattern.test(raw)) return p; // ignore invalid char
      const val = parseInt(raw, 10);
      return { ...p, quantity: isNaN(val)?0:val, quantityInput: raw };
    }));
  };
  const updatePrice = (id, raw) => {
    // Allow intermediate decimals like '1.', '.5', '12.34'
    const pattern = /^(\d+)?(\.\d{0,2})?$/; // up to 2 decimals
    setCart(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (raw === '') return { ...p, priceInput: '', price: 0 };
      if (!pattern.test(raw)) return p; // reject invalid pattern
      // parse but keep raw untouched for display
      const val = parseFloat(raw);
      return { ...p, price: isNaN(val)?0:val, priceInput: raw };
    }));
  };
  const deleteItem = (id) => {
    if (!confirm('Delete this item?')) return;
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('appItems', JSON.stringify(updated));
      return updated;
    });
    setCart(prev => prev.filter(c => c.id !== id));
  };

  // Receipt helpers
  const formatDate = (d) => {
    if (storeSettings.dateFormat === 'MM/DD/YYYY') return d.toLocaleDateString('en-US');
    if (storeSettings.dateFormat === 'YYYY-MM-DD') return d.toLocaleDateString('en-CA');
    return d.toLocaleDateString('en-GB');
  };
  const formatTime = (d) => storeSettings.timeFormat === '12hour'
    ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const generateReceiptHTML = (itemsList = cart, saleMeta) => {
    const now = saleMeta?.date ? new Date(saleMeta.date) : new Date();
    return `
      <div style="font-family:'Courier New',monospace;width:300px;margin:0 auto;padding:20px;">
        ${(storeSettings.showStoreName||storeSettings.showStoreAddress||storeSettings.showStorePhone) ? `
          <div style='text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px;'>
            ${storeSettings.showStoreName?`<h2 style='margin:0;'>${storeSettings.storeName}</h2>`:''}
            ${storeSettings.showStoreAddress?`<div>${storeSettings.storeAddress}</div>`:''}
            ${storeSettings.showStorePhone?`<div>${storeSettings.storePhone}</div>`:''}
          </div>`:''}
        <div style='margin-bottom:15px;'>
          ${storeSettings.showDate?`<div>${storeSettings.dateLabel} ${formatDate(now)}</div>`:''}
          ${storeSettings.showTime?`<div>${storeSettings.timeLabel} ${formatTime(now)}</div>`:''}
          ${storeSettings.showCustomer?`<div>${storeSettings.customerLabel} ${(saleMeta?.customer)||customerName||storeSettings.walkInCustomer}</div>`:''}
        </div>
        ${storeSettings.showTableHeaders ? `
        <table style='width:100%;border-collapse:collapse;margin-bottom:15px;'>
          <thead><tr style='border-bottom:1px solid #000;'>
            <th style='text-align:center;padding:5px;'>${storeSettings.snoLabel}</th>
            <th style='text-align:left;padding:5px;'>${storeSettings.itemLabel}</th>
            <th style='text-align:center;padding:5px;'>${storeSettings.qtyLabel}</th>
            <th style='text-align:right;padding:5px;'>${storeSettings.priceLabel}</th>
            <th style='text-align:right;padding:5px;'>${storeSettings.totalLabel}</th>
          </tr></thead>
          <tbody>
            ${itemsList.map((it,i)=>`<tr>
              <td style='text-align:center;padding:3px;'>${i+1}</td>
              <td style='padding:3px;'>${it.name}</td>
              <td style='text-align:center;padding:3px;'>${it.quantity}</td>
              <td style='text-align:right;padding:3px;'>₹${it.price}</td>
              <td style='text-align:right;padding:3px;'>₹${(it.price*it.quantity).toFixed(2)}</td>
            </tr>`).join('')}
          </tbody>
        </table>` : `
        <div style='margin-bottom:15px;'>
          ${itemsList.map((it,i)=>`<div style='display:flex;justify-content:space-between;padding:2px 0;'>
            <span>${i+1}. ${it.name} x ${it.quantity}</span>
            <span>₹${(it.price*it.quantity).toFixed(2)}</span>
          </div>`).join('')}
        </div>`}
        <div style='border-top:2px solid #000;padding-top:10px;text-align:right;'>
          <strong>${storeSettings.grandTotalLabel} ₹${itemsList.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2)}</strong>
        </div>
        ${storeSettings.showFooter?`<div style='text-align:center;margin-top:20px;padding-top:10px;border-top:1px solid #000;'>${storeSettings.footerMessage}</div>`:''}
      </div>`;
  };

  const printReceipt = (html) => {
    const w = window.open('', '_blank');
    if (!w) return alert('Popup blocked');
    w.document.write(`<html><head><title>Receipt</title><style>body{margin:0}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  };

  const completeSale = () => {
    if (cart.length === 0) return alert('Cart empty');
    const receiptHtml = generateReceiptHTML();
    const saleData = {
      id: Date.now(),
      date: new Date().toISOString(),
      customer: customerName || storeSettings.walkInCustomer,
      items: cart.map(c => ({ ...c })),
      total: getTotal(),
      itemCount: cart.reduce((s,i)=>s+i.quantity,0),
      receiptHtml
    };
  // Persist via repository (local immediate + remote attempt)
    saveSale(saleData).then(result => {
      setSalesHistory(result.sales);
      if (result.remoteError) {
        pushNotification({ type:'warning', title:'Offline / Sync Deferred', message:'Sale saved locally. Will sync when online.' });
      } else {
        pushNotification({ type:'success', title:'Sale Completed', message:'Receipt printed and sale recorded.' });
      }
    });
    printReceipt(receiptHtml);
    setCart([]);
    setCustomerName('');
  };

  const viewSavedReceipt = (sale) => {
    const html = sale.receiptHtml || generateReceiptHTML(sale.items, sale);
    printReceipt(html);
  };

  const saveSettings = () => {
  saveSettingsData(storeSettings);
  pushNotification({ type:'success', title:'Settings Saved', message:'Receipt settings updated.' });
  };

  // Dashboard stats
  const getDashboardStats = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7*24*60*60*1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todaySales = salesHistory.filter(s => new Date(s.date) >= todayStart);
    const weekSales = salesHistory.filter(s => new Date(s.date) >= weekStart);
    const monthSales = salesHistory.filter(s => new Date(s.date) >= monthStart);
    const sum = (arr, fn) => arr.reduce((a,b)=>a+fn(b),0);
    return {
      totalSales: salesHistory.length,
      totalRevenue: sum(salesHistory, s=>s.total),
      todaySales: todaySales.length,
      todayRevenue: sum(todaySales, s=>s.total),
      weekSales: weekSales.length,
      weekRevenue: sum(weekSales, s=>s.total),
      monthSales: monthSales.length,
      monthRevenue: sum(monthSales, s=>s.total),
      totalItems: sum(salesHistory, s=>s.itemCount),
      averageSale: salesHistory.length ? sum(salesHistory, s=>s.total)/salesHistory.length : 0
    };
  };
  const getTopItems = () => {
    const counts = {};
    salesHistory.forEach(s => s.items.forEach(it => { counts[it.name] = (counts[it.name]||0)+it.quantity; }));
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({name,count}));
  };

  // UI sections
  const Clock = React.useCallback(() => {
    const [now, setNow] = useState(new Date());
    useEffect(()=>{
      const t = setInterval(()=> setNow(new Date()), 1000);
      return ()=> clearInterval(t);
    },[]);
    return (
      <div style={{fontSize:'13px',opacity:.9,background:'rgba(255,255,255,0.1)',padding:'6px 12px',borderRadius:'8px'}}>
        {now.toLocaleDateString('en-GB')} • {now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
      </div>
    );
  }, []);

  const Header = () => (
    <div style={{background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',padding:'20px 30px',borderRadius:'16px',marginBottom:'25px',boxShadow:'0 8px 32px rgba(102,126,234,0.15)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 style={{margin:0,fontSize:'28px',fontWeight:600}}>Simple Store</h1>
          <p style={{margin:'5px 0 0 0',opacity:.9,fontSize:'15px'}}>Modern Billing System</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          <Clock />
          <div style={{display:'flex',gap:'2px',background:'rgba(255,255,255,0.1)',padding:'4px',borderRadius:'12px'}}>
            {['billing','dashboard','settings'].map(p => (
              <button key={p} onClick={()=>setCurrentPage(p)} style={{background: currentPage===p?'rgba(255,255,255,0.25)':'transparent',color:'#fff',border:'none',padding:'10px 20px',borderRadius:'10px',cursor:'pointer',fontWeight:500,fontSize:'13px',textTransform:'capitalize'}}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const BillingPage = () => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'25px'}}>
      {/* Items */}
      <div style={panelStyle}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={panelTitle}>Items</h2>
          <button onClick={()=>setShowAddItem(!showAddItem)} style={primaryButton}>+ Add Item</button>
        </div>
        {showAddItem && <div style={subPanel}>
          <h3 style={subTitle}>Add New Item</h3>
            <input
              type='text'
              placeholder='Enter item name'
              value={newItem.name}
              onChange={e=>setNewItem({name:e.target.value})}
              onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addNewItem(); } }}
              style={inputStyle}
            />
            <div style={{marginTop:'12px',display:'flex',gap:'8px'}}>
              <button onClick={addNewItem} style={successBtn}>Add</button>
              <button onClick={()=>setShowAddItem(false)} style={neutralBtn}>Cancel</button>
            </div>
        </div>}
        <div style={{marginBottom:'20px'}}>
          <input type='text' placeholder='🔍 Search items...' value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={searchInput} />
        </div>
        <div style={{maxHeight:'380px',overflowY:'auto'}}>
          {getFilteredItems().length===0 ? <EmptyState icon={searchTerm?'🔍':'📦'} title={searchTerm?'No items found':'No items yet'} subtitle={searchTerm? 'Try a different search term':'Add your first item to get started'} dashed /> : getFilteredItems().map(i => <div key={i.id} style={listItem}>
            <div style={{fontWeight:500,fontSize:'15px',color:'#374151'}}>{i.name}</div>
            <div style={{display:'flex',gap:'6px'}}>
              <button onClick={()=>addToCart(i)} style={successMini}>Add to Cart</button>
              <button onClick={()=>deleteItem(i.id)} style={dangerMini} title='Delete Item'>🗑️</button>
            </div>
          </div>)}
        </div>
      </div>
      {/* Cart */}
      <div style={panelStyle}>
        <h2 style={panelTitle}>Shopping Cart</h2>
        <input type='text' placeholder='Customer name (optional)' value={customerName} onChange={e=>setCustomerName(e.target.value)} style={inputStyle} />
        <div style={{marginBottom:'20px',maxHeight:'320px',overflowY:'auto'}}>
          {cart.length===0 ? <EmptyState icon='🛒' title='Cart is empty' subtitle='Add items from the left panel' dashed /> : cart.map(item => <div key={item.id} style={cartItem}>
            <div style={{fontWeight:500,marginBottom:'12px',color:'#374151',fontSize:'15px'}}>{item.name}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',alignItems:'center'}}>
              <div>
                <Label>Price (₹)</Label>
                  <input type='text' value={item.priceInput ?? String(item.price)} onChange={e=>updatePrice(item.id,e.target.value)} inputMode='decimal' style={smallInput} />
              </div>
              <div>
                <Label>Quantity</Label>
                <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  <QtyBtn onClick={()=>updateQuantity(item.id,String(Math.max( (item.quantity||0)-1, 0)))}>-</QtyBtn>
                  <input type='text' value={item.quantityInput ?? String(item.quantity)} onChange={e=>updateQuantity(item.id, e.target.value)} inputMode='numeric' style={qtyInput} />
                  <QtyBtn green onClick={()=>updateQuantity(item.id,String((item.quantity||0)+1))}>+</QtyBtn>
                </div>
              </div>
              <div>
                <Label>Total</Label>
                <div style={totalBadge}>₹{(item.price*item.quantity).toFixed(2)}</div>
              </div>
            </div>
            <div style={{marginTop:'10px',textAlign:'right'}}>
              <button onClick={()=>updateQuantity(item.id,0)} style={removeBtn}>Remove</button>
            </div>
          </div>)}
        </div>
        <div style={cartFooter}>
          <div style={grandTotalText}>Total: ₹{getTotal().toFixed(2)}</div>
          <button onClick={completeSale} disabled={!cart.length} style={{...checkoutBtn, ...(cart.length?{}:disabledBtn)}}>{cart.length? 'Complete Sale & Print Receipt':'Add items to cart'}</button>
        </div>
      </div>
    </div>
  );

  const SettingsPage = () => {
    const visibilityOpts = [
      ['showStoreName','Store Name'],['showStoreAddress','Store Address'],['showStorePhone','Phone Number'],['showDate','Date'],['showTime','Time'],['showCustomer','Customer Name'],['showTableHeaders','Table Headers'],['showFooter','Footer Message']
    ];
    const infoFields = [
      ['storeName','Store Name','Your Store Name'],['storeAddress','Store Address','Your Address'],['storePhone','Phone Number','Your Phone'],['footerMessage','Footer Message','Thank You, Visit Again!']
    ];
    return (
      <div style={settingsWrapper}>
        <h2 style={settingsTitle}>Receipt Settings</h2>
        <div style={{marginBottom:'30px'}}>
          <h3 style={sectionTitle}>Visibility Options</h3>
          <div style={visibilityGrid}>
            {visibilityOpts.map(([key,label]) => (
              <label key={key} style={{...toggleBox,border: storeSettings[key]?'1px solid #10b981':'1px solid #e5e7eb'}}>
                <input type='checkbox' checked={storeSettings[key]} onChange={e=>setStoreSettings({...storeSettings,[key]:e.target.checked})} style={{width:16,height:16}} />
                <span style={toggleLabel}>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'30px'}}>
          <h3 style={sectionTitle}>Store Information</h3>
          <div style={infoGrid}>
            {infoFields.map(([key,label,ph]) => (
              <div key={key}>
                <label style={fieldLabel}>{label}:</label>
                <input type='text' value={storeSettings[key]} onChange={e=>setStoreSettings({...storeSettings,[key]:e.target.value})} placeholder={ph} style={infoInput} />
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:'center'}}>
          <button onClick={saveSettings} style={settingsSaveBtn}>Save Settings</button>
        </div>
      </div>
    );
  };

  const DashboardPage = () => {
    const stats = getDashboardStats();
    const topItems = getTopItems();
    const statCards = [
      {title:"Today's Sales", value: stats.todaySales, revenue: stats.todayRevenue, color:'#10b981', bg:'#d1fae5'},
      {title:'This Week', value: stats.weekSales, revenue: stats.weekRevenue, color:'#f59e0b', bg:'#fef3c7'},
      {title:'This Month', value: stats.monthSales, revenue: stats.monthRevenue, color:'#3b82f6', bg:'#dbeafe'},
      {title:'Total Sales', value: stats.totalSales, revenue: stats.totalRevenue, color:'#8b5cf6', bg:'#ede9fe'}
    ];
    return (
      <div style={settingsWrapper}>
        <h2 style={settingsTitle}>Sales Dashboard</h2>
        <div style={statGrid}>
          {statCards.map((s,i)=>(
            <div key={i} style={{...statCard, background:s.bg, border:`1px solid ${s.color}30`}}>
              <h3 style={{margin:'0 0 12px 0',color:s.color,fontSize:14,fontWeight:600}}>{s.title}</h3>
              <div style={{fontSize:28,fontWeight:700,color:s.color,marginBottom:4}}>{s.value}</div>
              <div style={{fontSize:13,color:'#6b7280',fontWeight:500}}>₹{s.revenue.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div style={twoColRow}>
          <div style={miniPanel}>
            <h3 style={miniTitle}>Quick Stats</h3>
            {[['Total Items Sold',stats.totalItems],['Average Sale',`₹${stats.averageSale.toFixed(2)}`],['Total Transactions',salesHistory.length]].map(([l,v],i)=>(
              <div key={i} style={rowStat}><span style={rowLabel}>{l}:</span><strong style={rowValue}>{v}</strong></div>
            ))}
          </div>
          <div style={miniPanel}>
            <h3 style={miniTitle}>Top Selling Items</h3>
            {topItems.length ? topItems.map((t,i)=>(
              <div key={i} style={topItemRow}><span style={topItemLabel}>{i+1}. {t.name}</span><strong style={topItemValue}>{t.count} sold</strong></div>
            )) : <div style={italicEmpty}>No sales data yet</div>}
          </div>
        </div>
        <div style={miniPanel}>
          <h3 style={miniTitle}>Recent Sales & Receipts</h3>
          {salesHistory.length ? <div style={{maxHeight:350,overflowY:'auto'}}>
            {salesHistory.slice(-10).reverse().map(sale => (
              <div key={sale.id} style={saleRow}>
                <div style={{flex:1}}>
                  <div style={saleCustomer}>{sale.customer}</div>
                  <div style={saleMeta}>{new Date(sale.date).toLocaleDateString()} • {new Date(sale.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                  <div style={saleItems}>{sale.itemCount} items • {sale.items.map(it=>`${it.name} (${it.quantity})`).join(', ')}</div>
                </div>
                <div style={saleRight}>
                  <div style={saleTotal}>₹{sale.total.toFixed(2)}</div>
                  <div style={saleId}>#{sale.id.toString().slice(-6)}</div>
                </div>
                <button onClick={()=>viewSavedReceipt(sale)} style={receiptBtn} title='View & Print Receipt'>View Receipt</button>
              </div>
            ))}
          </div> : <EmptyState icon='📊' title='No sales data yet' subtitle='Complete a sale to see analytics and receipts' dashed />}
        </div>
      </div>
    );
  };

  // Shared styled helpers
  const panelStyle = {background:'#fff',borderRadius:16,padding:25,boxShadow:'0 4px 20px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb'};
  const panelTitle = {margin:0,fontSize:20,fontWeight:600,color:'#374151'};
  const subPanel = {background:'#f9fafb',padding:20,borderRadius:12,marginBottom:20,border:'1px solid #e5e7eb'};
  const subTitle = {margin:'0 0 12px 0',color:'#374151',fontSize:16,fontWeight:600};
  const inputStyle = {width:'100%',padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:20};
  const searchInput = {...inputStyle,marginBottom:0,borderRadius:10,padding:'12px 16px',background:'#f9fafb'};
  const listItem = {display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,margin:'6px 0',background:'#f9fafb',borderRadius:12,border:'1px solid #e5e7eb'};
  const successMini = {background:'linear-gradient(135deg,#10b981 0%,#059669 100%)',color:'#fff',border:'none',padding:'8px 14px',borderRadius:8,cursor:'pointer',fontWeight:500,fontSize:12};
  const dangerMini = {background:'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)',color:'#fff',border:'none',padding:'8px 10px',borderRadius:8,cursor:'pointer'};
  const primaryButton = {background:'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)',color:'#fff',border:'none',padding:'10px 20px',borderRadius:10,cursor:'pointer',fontWeight:500,fontSize:13,boxShadow:'0 2px 10px rgba(59,130,246,0.3)'};
  const successBtn = {...successMini,padding:'8px 16px',fontSize:13,borderRadius:6};
  const neutralBtn = {background:'#e5e7eb',color:'#6b7280',border:'none',padding:'8px 16px',borderRadius:6,cursor:'pointer',fontWeight:500,fontSize:13};
  const cartItem = {padding:16,margin:'6px 0',background:'#f9fafb',borderRadius:12,border:'1px solid #e5e7eb'};
  const smallInput = {width:'100%',padding:'6px 8px',border:'1px solid #d1d5db',borderRadius:6,fontSize:13,textAlign:'center',outline:'none'};
  const qtyInput = {width:40,padding:4,border:'1px solid #d1d5db',borderRadius:4,textAlign:'center',fontSize:13,outline:'none'};
  const totalBadge = {padding:'6px 8px',background:'#d1fae5',borderRadius:6,textAlign:'center',fontWeight:600,color:'#065f46',fontSize:13};
  const removeBtn = {background:'#fee2e2',color:'#dc2626',border:'none',padding:'4px 10px',borderRadius:4,cursor:'pointer',fontSize:11,fontWeight:500};
  const cartFooter = {borderTop:'1px solid #e5e7eb',paddingTop:20,background:'#f9fafb',margin:'0 -25px -25px -25px',padding:'20px 25px 25px 25px',borderRadius:'0 0 16px 16px'};
  const grandTotalText = {fontSize:24,fontWeight:700,textAlign:'center',marginBottom:16,color:'#374151'};
  const checkoutBtn = {width:'100%',background:'linear-gradient(135deg,#10b981 0%,#059669 100%)',color:'#fff',border:'none',padding:14,borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,0.3)'};
  const disabledBtn = {background:'#e5e7eb',color:'#9ca3af',cursor:'not-allowed',boxShadow:'none'};
  const settingsWrapper = {background:'#fff',borderRadius:16,padding:30,boxShadow:'0 4px 20px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb',maxWidth:900,margin:'0 auto'};
  const settingsTitle = {margin:'0 0 30px 0',color:'#374151',textAlign:'center',fontSize:24,fontWeight:600};
  const sectionTitle = {margin:'0 0 16px 0',color:'#6b7280',fontSize:18,fontWeight:600,borderBottom:'1px solid #e5e7eb',paddingBottom:8};
  const visibilityGrid = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,background:'#f9fafb',padding:20,borderRadius:12};
  const toggleBox = {display:'flex',alignItems:'center',gap:8,padding:10,background:'#fff',borderRadius:8,cursor:'pointer'};
  const toggleLabel = {fontWeight:500,color:'#374151',fontSize:14};
  const infoGrid = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:16};
  const fieldLabel = {display:'block',fontWeight:500,marginBottom:6,color:'#374151',fontSize:14};
  const infoInput = {width:'100%',padding:'10px 14px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box'};
  const settingsSaveBtn = {background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',color:'#fff',border:'none',padding:'12px 32px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:15,boxShadow:'0 4px 20px rgba(102,126,234,0.3)'};
  const statGrid = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:30};
  const statCard = {padding:20,borderRadius:12,textAlign:'center'};
  const twoColRow = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:25,marginBottom:30};
  const miniPanel = {background:'#f9fafb',padding:20,borderRadius:12,border:'1px solid #e5e7eb'};
  const miniTitle = {margin:'0 0 16px 0',color:'#374151',fontSize:16,fontWeight:600};
  const rowStat = {display:'flex',justifyContent:'space-between',padding:'6px 0'};
  const rowLabel = {color:'#6b7280',fontWeight:500,fontSize:14};
  const rowValue = {color:'#374151',fontSize:14};
  const topItemRow = {display:'flex',justifyContent:'space-between',padding:'8px 10px',background:'#fff',borderRadius:6,border:'1px solid #e5e7eb',marginBottom:8};
  const topItemLabel = {color:'#6b7280',fontWeight:500,fontSize:14};
  const topItemValue = {color:'#374151',fontSize:14};
  const italicEmpty = {color:'#9ca3af',fontStyle:'italic',textAlign:'center',padding:16,fontSize:14};
  const saleRow = {display:'flex',justifyContent:'space-between',alignItems:'center',padding:16,marginBottom:10,background:'#fff',borderRadius:10,border:'1px solid #e5e7eb',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'};
  const saleCustomer = {fontWeight:500,color:'#374151',fontSize:15,marginBottom:3};
  const saleMeta = {fontSize:12,color:'#6b7280',marginBottom:3};
  const saleItems = {fontSize:11,color:'#9ca3af'};
  const saleRight = {textAlign:'right',marginRight:12};
  const saleTotal = {fontWeight:600,color:'#10b981',fontSize:16};
  const saleId = {fontSize:10,color:'#9ca3af'};
  const receiptBtn = {background:'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)',color:'#fff',border:'none',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:11,fontWeight:500};

  // Small components
  const EmptyState = ({icon,title,subtitle,dashed}) => (
    <div style={{textAlign:'center',padding:'50px 20px',color:'#9ca3af',background:'#fff',borderRadius:12,border: dashed? '2px dashed #d1d5db':'1px solid #e5e7eb'}}>
      <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
      <p style={{margin:0,fontSize:15,fontWeight:500}}>{title}</p>
      <p style={{margin:'4px 0 0 0',fontSize:13}}>{subtitle}</p>
    </div>
  );
  const Label = ({children}) => <label style={{display:'block',fontSize:11,color:'#6b7280',marginBottom:3,fontWeight:500}}>{children}</label>;
  const QtyBtn = ({children,green,...rest}) => <button {...rest} style={{width:24,height:24,background:green?'#34d399':'#fbbf24',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:600}}>{children}</button>;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)',padding:20,fontFamily:"'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>
      <Header />
      {currentPage==='billing' && <BillingPage />}
      {currentPage==='settings' && <SettingsPage />}
      {currentPage==='dashboard' && <DashboardPage />}
      <NotificationBar notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
}

export default App;