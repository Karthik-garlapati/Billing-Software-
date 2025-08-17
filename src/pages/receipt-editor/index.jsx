import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { demoReceiptService } from '../../services/demoReceiptService';

const ReceiptEditor = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState({
    storeName: 'YOUR STORE NAME',
    storeAddress: 'Your Store Address',
    storePhone: 'Your Phone Number',
    headerText: 'CREDIT\nESTIMATE/QUOTATION',
    footerText: 'THANK YOU VISIT AGAIN',
    showDate: true,
    showTime: true,
    showCustomerInfo: true,
    showItemHeaders: true,
    currency: '₹',
    fontSize: '12px',
    paperWidth: '80mm'
  });

  const [previewData] = useState({
    receipt_number: 'RCP-20250817-666467',
    created_at: new Date().toISOString(),
    customer_name: 'WALK-IN CUSTOMER',
    customer_phone: '',
    receipt_items: [
      { name: 'BAJRI', quantity: 1, price_inr: 52.00 },
      { name: 'SAMPLE ITEM 2', quantity: 2, price_inr: 25.00 }
    ],
    total_amount: 102.00
  });

  useEffect(() => {
    // Load saved template from localStorage
    const savedTemplate = localStorage.getItem('receiptTemplate');
    if (savedTemplate) {
      setTemplate({ ...template, ...JSON.parse(savedTemplate) });
    }
  }, []);

  const saveTemplate = () => {
    localStorage.setItem('receiptTemplate', JSON.stringify(template));
    alert('Receipt template saved successfully!');
  };

  const resetTemplate = () => {
    const defaultTemplate = {
      storeName: 'YOUR STORE NAME',
      storeAddress: 'Your Store Address',
      storePhone: 'Your Phone Number',
      headerText: 'CREDIT\nESTIMATE/QUOTATION',
      footerText: 'THANK YOU VISIT AGAIN',
      showDate: true,
      showTime: true,
      showCustomerInfo: true,
      showItemHeaders: true,
      currency: '₹',
      fontSize: '12px',
      paperWidth: '80mm'
    };
    setTemplate(defaultTemplate);
    localStorage.removeItem('receiptTemplate');
  };

  const generatePreviewHTML = () => {
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

    const total = previewData.receipt_items.reduce((sum, item) => sum + (item.price_inr * item.quantity), 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt Preview</title>
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
          .total-section {
            border-top: 1px solid #000;
            margin-top: 10px;
            padding-top: 5px;
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
            <div>No. ${previewData.receipt_number} ${template.showDate ? `DATE: ${formatDate(previewData.created_at)}` : ''}</div>
            ${template.showCustomerInfo ? `<div>${previewData.customer_name || 'WALK-IN CUSTOMER'}</div>` : ''}
            ${template.showTime ? `<div>Time: ${formatTime(previewData.created_at)}</div>` : ''}
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
              ${previewData.receipt_items.map((item, index) => `
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
            ${previewData.receipt_items.map((item, index) => `
              <div>${index + 1}. ${item.name} - ${item.quantity} × ${template.currency}${item.price_inr.toFixed(2)} = ${template.currency}${(item.price_inr * item.quantity).toFixed(2)}</div>
            `).join('')}
          </div>
          `}

          <div class="dotted-line"></div>

          <div class="total-section">
            <div class="total-amount">${template.currency}${total.toFixed(2)}</div>
            <div style="margin-top: 5px;">${formatTime(previewData.created_at)}</div>
          </div>

          <div class="dotted-line"></div>

          <div class="footer">
            ${template.footerText}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const previewReceipt = () => {
    const receiptHTML = generatePreviewHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Receipt Template Editor</h1>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            ← Back to Billing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Customize Receipt Template</h2>
          
          <div className="space-y-4">
            {/* Store Information */}
            <div>
              <h3 className="font-semibold mb-2">Store Information</h3>
              <div className="space-y-2">
                <Input
                  label="Store Name"
                  value={template.storeName}
                  onChange={(e) => setTemplate({...template, storeName: e.target.value})}
                  placeholder="Your Store Name"
                />
                <Input
                  label="Store Address"
                  value={template.storeAddress}
                  onChange={(e) => setTemplate({...template, storeAddress: e.target.value})}
                  placeholder="Your Store Address"
                />
                <Input
                  label="Phone Number"
                  value={template.storePhone}
                  onChange={(e) => setTemplate({...template, storePhone: e.target.value})}
                  placeholder="Your Phone Number"
                />
              </div>
            </div>

            {/* Header & Footer Text */}
            <div>
              <h3 className="font-semibold mb-2">Header & Footer</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Header Text</label>
                  <textarea
                    value={template.headerText}
                    onChange={(e) => setTemplate({...template, headerText: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="2"
                    placeholder="CREDIT\nESTIMATE/QUOTATION"
                  />
                </div>
                <Input
                  label="Footer Text"
                  value={template.footerText}
                  onChange={(e) => setTemplate({...template, footerText: e.target.value})}
                  placeholder="THANK YOU VISIT AGAIN"
                />
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h3 className="font-semibold mb-2">Display Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={template.showDate}
                    onChange={(e) => setTemplate({...template, showDate: e.target.checked})}
                    className="mr-2"
                  />
                  Show Date
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={template.showTime}
                    onChange={(e) => setTemplate({...template, showTime: e.target.checked})}
                    className="mr-2"
                  />
                  Show Time
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={template.showCustomerInfo}
                    onChange={(e) => setTemplate({...template, showCustomerInfo: e.target.checked})}
                    className="mr-2"
                  />
                  Show Customer Info
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={template.showItemHeaders}
                    onChange={(e) => setTemplate({...template, showItemHeaders: e.target.checked})}
                    className="mr-2"
                  />
                  Show Item Table Headers
                </label>
              </div>
            </div>

            {/* Formatting Options */}
            <div>
              <h3 className="font-semibold mb-2">Formatting</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Currency Symbol</label>
                  <select
                    value={template.currency}
                    onChange={(e) => setTemplate({...template, currency: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="₹">₹ (Rupees)</option>
                    <option value="$">$ (Dollar)</option>
                    <option value="€">€ (Euro)</option>
                    <option value="Rs.">Rs.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Font Size</label>
                  <select
                    value={template.fontSize}
                    onChange={(e) => setTemplate({...template, fontSize: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="10px">Small (10px)</option>
                    <option value="12px">Medium (12px)</option>
                    <option value="14px">Large (14px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={saveTemplate}
                className="bg-green-500 hover:bg-green-600 text-white flex-1"
              >
                Save Template
              </Button>
              <Button
                onClick={resetTemplate}
                className="bg-red-500 hover:bg-red-600 text-white flex-1"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            <Button
              onClick={previewReceipt}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Open Preview
            </Button>
          </div>
          
          <div className="border border-gray-300 p-4 bg-gray-50 rounded">
            <div 
              className="bg-white p-4 mx-auto"
              style={{ 
                width: template.paperWidth === '80mm' ? '300px' : '400px',
                fontSize: template.fontSize,
                fontFamily: '"Courier New", monospace'
              }}
            >
              <div className="text-center border border-gray-400 p-3">
                <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
                  <div style={{ whiteSpace: 'pre-line', fontWeight: 'bold' }}>
                    {template.headerText}
                  </div>
                  <div className="font-bold text-lg">{template.storeName}</div>
                  <div>{template.storeAddress}</div>
                  <div>PHONE: {template.storePhone}</div>
                </div>

                <div className="text-left my-2 border-b border-dashed border-gray-400 pb-2">
                  <div>No. {previewData.receipt_number} {template.showDate && `DATE: 17/08/2025`}</div>
                  {template.showCustomerInfo && <div>WALK-IN CUSTOMER</div>}
                  {template.showTime && <div>Time: 10:44</div>}
                </div>

                {template.showItemHeaders ? (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="text-left">SNo Item</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.receipt_items.map((item, index) => (
                        <tr key={index} className="border-b border-dotted border-gray-400">
                          <td>{index + 1} {item.name}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">{template.currency}{item.price_inr.toFixed(2)}</td>
                          <td className="text-right">{template.currency}{(item.price_inr * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-left text-xs">
                    {previewData.receipt_items.map((item, index) => (
                      <div key={index}>
                        {index + 1}. {item.name} - {item.quantity} × {template.currency}{item.price_inr.toFixed(2)} = {template.currency}{(item.price_inr * item.quantity).toFixed(2)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-400 mt-2 pt-2">
                  <div className="font-bold">{template.currency}{previewData.receipt_items.reduce((sum, item) => sum + (item.price_inr * item.quantity), 0).toFixed(2)}</div>
                  {template.showTime && <div className="text-xs">10:44</div>}
                </div>

                <div className="border-t border-dashed border-gray-400 mt-2 pt-2 font-bold">
                  {template.footerText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptEditor;
