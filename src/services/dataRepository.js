// Unified data repository: Supabase (remote) + localStorage (fallback)
// Provides functions to load initial data, save a sale, and save settings.
// Remote integration is opportunistic: if user authenticated (Supabase session exists) it will
// attempt remote persistence; otherwise silently uses local only.

import { supabase } from '../lib/supabase';

const SALES_KEY = 'salesHistory';
const SETTINGS_KEY = 'storeSettings';
const PENDING_KEY = 'pendingSales';

// ---- Local helpers ----
function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('Local read error', key, e);
    return fallback;
  }
}

function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('Local write error', key, e); }
}

// Default settings mirror initial state in App (keep in sync if changed there)
const defaultSettings = {
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
};

async function getSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch (e) {
    return null;
  }
}

// ---- Remote mappers ----
function mapInvoiceToSale(invoice, lineItems) {
  const items = (lineItems || []).map(li => ({
    name: li.description,
    price: Number(li.unit_price || 0),
    quantity: Number(li.quantity || 0)
  }));
  const total = items.reduce((s,i)=> s + i.price * i.quantity, 0);
  return {
    id: invoice.id,
    date: invoice.created_at,
    customer: invoice.client_name || 'Customer',
    items,
    total,
    itemCount: items.reduce((s,i)=>s+i.quantity,0),
    receiptHtml: null // generated locally when viewed
  };
}

async function fetchRemoteSales(userId) {
  // Fetch recent invoices with nested line items (limited to last 50 for efficiency)
  const { data, error } = await supabase
    .from('invoices')
    .select('id, created_at, total_amount, clients(name), invoice_line_items(description, quantity, unit_price)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data.map(inv => mapInvoiceToSale({
    id: inv.id,
    created_at: inv.created_at,
    client_name: inv.clients?.name
  }, inv.invoice_line_items || []));
}

export async function loadInitialData() {
  const localSettings = readLocal(SETTINGS_KEY, defaultSettings);
  const localSales = readLocal(SALES_KEY, []);
  const session = await getSession();
  if (!session) {
    return { settings: localSettings, sales: localSales };
  }
  try {
    const remoteSales = await fetchRemoteSales(session.user.id);
    // Merge remote + local (avoid duplicates by id)
    const mergedMap = new Map();
    [...remoteSales, ...localSales].forEach(s => mergedMap.set(s.id, s));
    const merged = Array.from(mergedMap.values()).sort((a,b)=> new Date(a.date) - new Date(b.date));
    writeLocal(SALES_KEY, merged);
    return { settings: localSettings, sales: merged };
  } catch (e) {
    console.warn('Remote fetch failed, using local only', e.message);
    return { settings: localSettings, sales: localSales };
  }
}

export async function saveSettingsData(settings) {
  writeLocal(SETTINGS_KEY, settings);
  // Optional: persist remote company settings if authenticated
  const session = await getSession();
  if (!session) return;
  try {
    // Upsert basic company_settings row (subset mapped)
    await supabase.from('company_settings').upsert({
      user_id: session.user.id,
      company_name: settings.storeName,
      company_address: settings.storeAddress,
      company_phone: settings.storePhone
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.warn('Remote settings save failed (ignored):', e.message);
  }
}

export async function saveSale(sale) {
  // Always update local snapshot immediately for responsiveness
  const current = readLocal(SALES_KEY, []);
  const updatedLocal = [...current, sale];
  writeLocal(SALES_KEY, updatedLocal);

  const session = await getSession();
  let remoteError = null;
  if (session) {
    try {
      // Generate invoice number via RPC (optional)
      let invoiceNumber = null;
      try {
        const { data: numData } = await supabase.rpc('generate_invoice_number', { company_user_id: session.user.id });
        invoiceNumber = numData || null;
      } catch (_) { /* ignore */ }

      const issueDate = new Date();
      const dueDate = new Date(issueDate.getTime() + 30*24*60*60*1000);

      const { data: invoiceInsert, error: invErr } = await supabase.from('invoices').insert({
        user_id: session.user.id,
        client_id: null, // No client mapped in simple POS flow
        invoice_number: invoiceNumber || `POS-${Date.now()}`,
        status: 'paid',
        issue_date: issueDate.toISOString().substring(0,10),
        due_date: dueDate.toISOString().substring(0,10),
        subtotal: sale.items.reduce((s,i)=> s + i.price * i.quantity, 0),
        total_amount: sale.total,
        paid_amount: sale.total,
        balance_due: 0
      }).select('id').single();
      if (invErr) throw invErr;
      const invoiceId = invoiceInsert.id;

      // Insert line items
      const lineItemsPayload = sale.items.map(it => ({
        invoice_id: invoiceId,
        description: it.name,
        quantity: it.quantity,
        unit_price: it.price,
        line_total: it.price * it.quantity
      }));
      const { error: liErr } = await supabase.from('invoice_line_items').insert(lineItemsPayload);
      if (liErr) throw liErr;
    } catch (e) {
      remoteError = e.message;
      console.warn('Remote sale save failed, queued for retry:', remoteError);
      // Queue sale for later sync
      const pending = readLocal(PENDING_KEY, []);
      pending.push(sale);
      writeLocal(PENDING_KEY, pending);
    }
  }
  return { sales: updatedLocal, remoteError };
}

export async function syncPendingSales() {
  const session = await getSession();
  if (!session) return { synced: 0 };
  const pending = readLocal(PENDING_KEY, []);
  if (!pending.length) return { synced: 0 };
  let synced = 0;
  const remaining = [];
  for (const sale of pending) {
    try {
      await saveSale(sale); // saveSale handles remote insert & local persistence
      synced++;
    } catch (e) {
      remaining.push(sale);
    }
  }
  writeLocal(PENDING_KEY, remaining);
  return { synced };
}

