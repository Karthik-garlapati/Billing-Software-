// Sample data for testing the item management and POS system
// This file contains sample items that can be used for demonstration

export const sampleItems = [
  // Grain items like in the receipt
  {
    id: 'sample-1',
    name: 'Halsi',
    description: 'Premium quality halsi grain',
    category: 'Grains',
    price_inr: 92.00,
    stock_quantity: 50000,
    sku: 'HALSI-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-2',
    name: 'Ragi',
    description: 'Organic ragi millet',
    category: 'Grains',
    price_inr: 46.00,
    stock_quantity: 50000,
    sku: 'RAGI-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-3',
    name: 'Bajra',
    description: 'Quality bajra pearl millet',
    category: 'Grains',
    price_inr: 33.00,
    stock_quantity: 50000,
    sku: 'BAJRA-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-4',
    name: 'Badam',
    description: 'Premium almonds',
    category: 'Dry Fruits',
    price_inr: 780.00,
    stock_quantity: 5000,
    sku: 'BADAM-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-5',
    name: 'Gundu (L)',
    description: 'Large groundnuts',
    category: 'Nuts',
    price_inr: 95.00,
    stock_quantity: 50000,
    sku: 'GUNDU-L-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-6',
    name: 'Palli (M)',
    description: 'Medium groundnuts',
    category: 'Nuts',
    price_inr: 106.00,
    stock_quantity: 20000,
    sku: 'PALLI-M-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-7',
    name: 'White Batana',
    description: 'White batana beans',
    category: 'Pulses',
    price_inr: 48.00,
    stock_quantity: 15000,
    sku: 'WHITE-BATANA-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-8',
    name: 'Udad Dal',
    description: 'Black gram dal',
    category: 'Pulses',
    price_inr: 98.00,
    stock_quantity: 10000,
    sku: 'UDAD-DAL-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-9',
    name: 'Kaju',
    description: 'Premium cashew nuts',
    category: 'Dry Fruits',
    price_inr: 750.00,
    stock_quantity: 2000,
    sku: 'KAJU-001',
    is_active: true,
    image_url: null
  },
  // Original items
  {
    id: 'sample-10',
    name: 'Tea Cup',
    description: 'Traditional ceramic tea cup',
    category: 'Beverages',
    price_inr: 25.00,
    stock_quantity: 50,
    sku: 'TEA-CUP-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-11',
    name: 'Notebook A4',
    description: '200 pages ruled notebook',
    category: 'Stationery',
    price_inr: 150.00,
    stock_quantity: 100,
    sku: 'NOTE-A4-001',
    is_active: true,
    image_url: null
  },
  {
    id: 'sample-12',
    name: 'Blue Pen',
    description: 'Blue ink ballpoint pen',
    category: 'Stationery',
    price_inr: 10.00,
    stock_quantity: 200,
    sku: 'PEN-BLUE-001',
    is_active: true,
    image_url: null
  }
];

export const sampleCategories = [
  'Grains',
  'Pulses', 
  'Nuts',
  'Dry Fruits',
  'Spices',
  'Oil Seeds',
  'Beverages',
  'Stationery',
  'Electronics',
  'Clothing',
  'Books',
  'Sports',
  'Health & Beauty'
];

// Format currency in INR
export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Generate receipt number
export const generateReceiptNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-6);
  
  return `RCP-${year}${month}${day}-${time}`;
};
