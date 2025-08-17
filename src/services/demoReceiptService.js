// Demo receipt service that uses localStorage for development/testing
import { demoItemService } from './demoItemService';
import { generateReceiptNumber, formatINR } from '../utils/sampleData';

export const demoReceiptService = {
  // Create new receipt
  async createReceipt(receiptData) {
    try {
      const receipts = JSON.parse(localStorage.getItem('billtracker_receipts') || '[]');
      
      // Calculate totals
      const subtotal = receiptData?.items?.reduce((sum, item) => 
        sum + (item?.quantity * item?.price_inr), 0
      );
      
      const taxAmount = subtotal * (receiptData?.tax_rate || 0) / 100;
      const discountAmount = receiptData?.discount_amount || 0;
      const total = subtotal + taxAmount - discountAmount;

      const newReceipt = {
        id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        receipt_number: receiptData?.receipt_number || generateReceiptNumber(),
        customer_name: receiptData?.customer_name || 'Walk-in Customer',
        customer_phone: receiptData?.customer_phone || '',
        subtotal: subtotal,
        tax_rate: receiptData?.tax_rate || 0,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        payment_method: receiptData?.payment_method || 'cash',
        payment_reference: receiptData?.payment_reference || '',
        notes: receiptData?.notes || '',
        created_at: new Date().toISOString()
      };

      // Add receipt items
      const receiptItems = receiptData?.items?.map((item, index) => ({
        id: `receipt-item-${Date.now()}-${index}`,
        receipt_id: newReceipt?.id,
        item_id: item?.id,
        item_name: item?.name,
        quantity: item?.quantity,
        price_inr: item?.price_inr,
        line_total: item?.quantity * item?.price_inr
      }));

      newReceipt.receipt_items = receiptItems;
      receipts.push(newReceipt);
      localStorage.setItem('billtracker_receipts', JSON.stringify(receipts));

      // Update stock quantities
      for (const item of receiptData?.items) {
        await demoItemService?.reduceStock(item?.id, item?.quantity);
      }

      return { data: newReceipt, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get all receipts
  async getReceipts(filters = {}) {
    try {
      let receipts = JSON.parse(localStorage.getItem('billtracker_receipts') || '[]');

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        receipts = receipts.filter(receipt =>
          receipt?.receipt_number?.toLowerCase()?.includes(searchTerm) ||
          receipt?.customer_name?.toLowerCase()?.includes(searchTerm)
        );
      }

      if (filters?.dateRange?.start || filters?.dateRange?.end) {
        receipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt?.created_at);
          const startDate = filters?.dateRange?.start ? new Date(filters.dateRange.start) : null;
          const endDate = filters?.dateRange?.end ? new Date(filters.dateRange.end) : null;
          
          if (startDate && receiptDate < startDate) return false;
          if (endDate && receiptDate > endDate) return false;
          return true;
        });
      }

      // Sort receipts
      receipts.sort((a, b) => {
        const aVal = a[filters?.sortBy || 'created_at'];
        const bVal = b[filters?.sortBy || 'created_at'];
        
        if (filters?.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return bVal > aVal ? 1 : -1;
      });

      return { data: receipts, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  },

  // Get receipt by ID
  async getReceiptById(receiptId) {
    try {
      const receipts = JSON.parse(localStorage.getItem('billtracker_receipts') || '[]');
      const receipt = receipts.find(receipt => receipt.id === receiptId);
      
      return { data: receipt || null, error: receipt ? null : 'Receipt not found' };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Generate receipt number
  generateReceiptNumber,

  // Format currency in INR
  formatINR,

  // Print receipt (generates HTML for printing)
  generateReceiptHTML: ({ receipt, items, companyInfo }) => {
    // Load custom template from localStorage
    const savedTemplate = localStorage.getItem('receiptTemplate');
    const template = savedTemplate ? JSON.parse(savedTemplate) : {
      storeName: companyInfo?.name || 'YOUR STORE NAME',
      storeAddress: companyInfo?.address || 'Your Store Address',
      storePhone: companyInfo?.phone || 'Your Phone Number',
      headerText: 'CREDIT\\nESTIMATE/QUOTATION',
      footerText: 'THANK YOU VISIT AGAIN',
      showDate: true,
      showTime: true,
      showCustomerInfo: true,
      showItemHeaders: true,
      currency: '₹',
      fontSize: '12px',
      paperWidth: '80mm'
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN');
    };

    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    const receiptItems = items || receipt.receipt_items || [];
    const total = receiptItems.reduce((sum, item) => sum + (item.price_inr * item.quantity), 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${receipt.receipt_number}</title>
        <style>
          @page {
            size: ${template.paperWidth} auto;
            margin: 5mm;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: ${template.fontSize};
            line-height: 1.2;
            margin: 0;
            padding: 10px;
            width: 100%;
            background: white;
          }
          .receipt {
            text-align: center;
            border: 1px solid #000;
            padding: 10px;
            max-width: 100%;
          }
          .header {
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          .company-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 3px;
          }
          .receipt-info {
            text-align: left;
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          .items-table th,
          .items-table td {
            text-align: left;
            padding: 2px 0;
            border-bottom: 1px dotted #000;
          }
          .items-table th {
            border-bottom: 1px solid #000;
            font-weight: bold;
          }
          .qty, .rate, .amount {
            text-align: right;
            width: 15%;
          }
          .item-name {
            width: 55%;
          }
          .items-section {
            text-align: left;
            margin: 10px 0;
          }
          .total-section {
            border-top: 1px solid #000;
            margin-top: 10px;
            padding-top: 5px;
            text-align: right;
          }
          .total-amount {
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-weight: bold;
          }
          .dotted-line {
            border-bottom: 1px dotted #000;
            height: 1px;
            margin: 5px 0;
          }
          @media print {
            body { margin: 0; }
            .receipt { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div style="white-space: pre-line; font-weight: bold;">${template.headerText}</div>
            <div class="company-name">${template.storeName}</div>
            <div>${template.storeAddress}</div>
            <div>PHONE: ${template.storePhone}</div>
          </div>

          <div class="dotted-line"></div>

          <div class="receipt-info">
            <div>No. ${receipt.receipt_number} ${template.showDate ? `DATE: ${formatDate(receipt.created_at)}` : ''}</div>
            ${template.showCustomerInfo ? `<div>${receipt.customer_name || 'WALK-IN CUSTOMER'}</div>` : ''}
            ${receipt.customer_phone ? `<div>Phone: ${receipt.customer_phone}</div>` : ''}
            ${template.showTime ? `<div>Time: ${formatTime(receipt.created_at)}</div>` : ''}
          </div>

          ${template.showItemHeaders ? `
          <table class="items-table">
            <thead>
              <tr>
                <th class="item-name">SNo Item</th>
                <th class="qty">Qty</th>
                <th class="rate">Rate</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${receiptItems.map((item, index) => `
                <tr>
                  <td class="item-name">${index + 1} ${item.name}</td>
                  <td class="qty">${item.quantity}</td>
                  <td class="rate">${template.currency}${item.price_inr.toFixed(2)}</td>
                  <td class="amount">${template.currency}${(item.price_inr * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : `
          <div class="items-section">
            ${receiptItems.map((item, index) => `
              <div>${index + 1}. ${item.name} - ${item.quantity} × ${template.currency}${item.price_inr.toFixed(2)} = ${template.currency}${(item.price_inr * item.quantity).toFixed(2)}</div>
            `).join('')}
          </div>
          `}

          <div class="dotted-line"></div>

          <div class="total-section">
            <div class="total-amount">${template.currency}${total.toFixed(2)}</div>
            <div style="margin-top: 5px; font-size: 10px;">${formatTime(receipt.created_at)}</div>
          </div>

          <div class="dotted-line"></div>

          <div class="footer">
            ${template.footerText}
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
