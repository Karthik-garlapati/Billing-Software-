import { supabase } from '../lib/supabase';
import { itemService } from './itemService';

export const receiptService = {
  // Create new receipt
  async createReceipt(receiptData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      // Calculate totals
      const subtotal = receiptData?.items?.reduce((sum, item) => 
        sum + (item?.quantity * item?.price_inr), 0
      );
      
      const taxAmount = subtotal * (receiptData?.tax_rate || 0) / 100;
      const discountAmount = receiptData?.discount_amount || 0;
      const total = subtotal + taxAmount - discountAmount;

      const newReceipt = {
        user_id: user?.id,
        receipt_number: receiptData?.receipt_number || `RCP-${Date.now()}`,
        customer_name: receiptData?.customer_name || 'Walk-in Customer',
        customer_phone: receiptData?.customer_phone || '',
        subtotal: subtotal,
        tax_rate: receiptData?.tax_rate || 0,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        payment_method: receiptData?.payment_method || 'cash',
        notes: receiptData?.notes || '',
        created_at: new Date().toISOString()
      };

      const { data: receipt, error: receiptError } = await supabase?.from('receipts')
        ?.insert([newReceipt])
        ?.select()
        ?.single();

      if (receiptError) return { data: null, error: receiptError };

      // Add receipt items
      const receiptItems = receiptData?.items?.map(item => ({
        receipt_id: receipt?.id,
        item_id: item?.id,
        item_name: item?.name,
        quantity: item?.quantity,
        price_inr: item?.price_inr,
        line_total: item?.quantity * item?.price_inr
      }));

      const { data: items, error: itemsError } = await supabase?.from('receipt_items')
        ?.insert(receiptItems)
        ?.select();

      if (itemsError) return { data: null, error: itemsError };

      // Update stock quantities
      for (const item of receiptData?.items) {
        await itemService?.reduceStock(item?.id, item?.quantity);
      }

      return { 
        data: { 
          ...receipt, 
          receipt_items: items 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get all receipts
  async getReceipts(filters = {}) {
    try {
      let query = supabase?.from('receipts')?.select(`
        *,
        receipt_items(*)
      `)?.order('created_at', { ascending: false });

      if (filters?.search) {
        query = query?.or(`receipt_number.ilike.%${filters?.search}%,customer_name.ilike.%${filters?.search}%`);
      }

      if (filters?.dateRange) {
        query = query?.gte('created_at', filters?.dateRange?.start)
          ?.lte('created_at', filters?.dateRange?.end);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get receipt by ID
  async getReceiptById(receiptId) {
    try {
      const { data, error } = await supabase?.from('receipts')?.select(`
        *,
        receipt_items(*)
      `)?.eq('id', receiptId)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Generate receipt number
  generateReceiptNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6);
    
    return `RCP-${year}${month}${day}-${time}`;
  },

  // Format currency in INR
  formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  },

  // Print receipt (generates HTML for printing)
  generateReceiptHTML(receiptData) {
    const { receipt, items, companyInfo } = receiptData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${receipt?.receipt_number}</title>
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 11px; 
          margin: 0; 
          padding: 15px; 
          line-height: 1.2;
          background: white;
        }
        .receipt { 
          max-width: 280px; 
          margin: 0 auto; 
          background: white;
          border: 1px solid #000;
          padding: 10px;
        }
        .header { 
          text-align: center; 
          border-bottom: 1px dashed #000; 
          padding-bottom: 8px; 
          margin-bottom: 8px; 
        }
        .company-name { 
          font-size: 13px; 
          font-weight: bold; 
          margin-bottom: 3px; 
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .company-details { 
          font-size: 9px; 
          line-height: 1.3;
        }
        .estimate-header {
          text-align: center;
          font-size: 10px;
          margin: 5px 0;
          text-transform: uppercase;
        }
        .receipt-info { 
          font-size: 9px;
          margin: 8px 0; 
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        .receipt-info div {
          margin: 1px 0;
        }
        .items-section {
          margin: 8px 0;
        }
        .items-header {
          border-bottom: 1px dashed #000;
          padding-bottom: 3px;
          margin-bottom: 5px;
          font-size: 9px;
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 2px 0;
          font-size: 9px;
          min-height: 12px;
        }
        .item-left {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .item-sno {
          width: 15px;
          text-align: left;
        }
        .item-name {
          flex: 1;
          text-align: left;
          margin-left: 5px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .item-right {
          display: flex;
          align-items: center;
          text-align: right;
        }
        .item-qty {
          width: 45px;
          text-align: right;
          margin-right: 10px;
        }
        .item-rate {
          width: 45px;
          text-align: right;
          margin-right: 10px;
        }
        .item-amount {
          width: 55px;
          text-align: right;
          font-weight: bold;
        }
        .totals { 
          margin-top: 8px; 
          border-top: 1px dashed #000; 
          padding-top: 5px; 
          text-align: right;
        }
        .grand-total { 
          font-weight: bold; 
          font-size: 12px; 
          border-top: 1px solid #000; 
          padding-top: 5px;
          margin-top: 5px;
          text-align: right;
        }
        .footer { 
          text-align: center; 
          margin-top: 10px; 
          border-top: 1px dashed #000; 
          padding-top: 8px; 
          font-size: 9px;
        }
        .time-stamp {
          font-size: 9px;
          text-align: left;
          margin-top: 5px;
        }
        @media print {
          body { margin: 0; padding: 5px; }
          .no-print { display: none; }
          .receipt { border: none; }
        }
        @page {
          size: 80mm auto;
          margin: 5mm;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="estimate-header">CREDIT<br>ESTIMATE/QUOTATION</div>
        
        <div class="header">
          <div class="company-name">${companyInfo?.name || 'BILLTRACKER PRO'}<br>STORE</div>
          <div class="company-details">
            ${companyInfo?.address || 'STATION ROAD COMMERCIAL AREA'}<br>
            PHONE: ${companyInfo?.phone || '8099832281/8019604600'}
          </div>
        </div>
        
        <div class="receipt-info">
          <div>No. : ${receipt?.receipt_number?.split('-')?.[2] || '001'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DATE : ${new Date(receipt?.created_at).toLocaleDateString('en-GB')}</div>
          <div style="font-weight: bold; text-transform: uppercase;">${receipt?.customer_name?.toUpperCase() || 'WALK-IN CUSTOMER'}</div>
          ${receipt?.customer_phone ? `<div>Ph : ${receipt?.customer_phone}</div>` : `<div>Ph :</div>`}
        </div>
        
        <div class="items-section">
          <div class="items-header">
            <span>SNo Item</span>
            <span>Qty&nbsp;&nbsp;&nbsp;Rate&nbsp;&nbsp;&nbsp;Amount</span>
          </div>
          <div style="border-bottom: 1px dashed #000; margin-bottom: 5px;"></div>
          
          ${items?.map((item, index) => `
            <div class="item-row">
              <div class="item-left">
                <span class="item-sno">${index + 1}</span>
                <span class="item-name">${item?.item_name?.toUpperCase()}</span>
              </div>
              <div class="item-right">
                <span class="item-qty">${parseFloat(item?.quantity).toLocaleString('en-IN')}</span>
                <span class="item-rate">${parseFloat(item?.price_inr).toFixed(2)}</span>
                <span class="item-amount">${parseFloat(item?.line_total).toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
          
          <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>
        </div>
        
        <div class="totals">
          ${receipt?.discount_amount > 0 ? `
            <div style="font-size: 9px; margin: 2px 0;">Discount: -₹${receipt?.discount_amount.toFixed(2)}</div>
          ` : ''}
          ${receipt?.tax_amount > 0 ? `
            <div style="font-size: 9px; margin: 2px 0;">Tax (${receipt?.tax_rate}%): ₹${receipt?.tax_amount.toFixed(2)}</div>
          ` : ''}
        </div>
        
        <div class="grand-total">
          ₹${parseFloat(receipt?.total_amount).toFixed(2)}
        </div>
        
        <div class="time-stamp">
          ${new Date(receipt?.created_at).toLocaleTimeString('en-IN', { hour12: false })}
          <span style="float: right;">==========</span>
        </div>
        
        <div class="footer">
          <div style="font-weight: bold; margin-top: 10px;">THANK YOU VISIT AGAIN</div>
        </div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Receipt</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
      </div>
    </body>
    </html>
    `;
  }
};
