-- Location: supabase/migrations/20250817000000_add_items_and_receipts.sql
-- Items and Receipt Management System
-- Module: Item Management and Receipt Printing with INR currency

-- 1. ITEMS TABLE
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price_inr DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Price in Indian Rupees
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT, -- Stock Keeping Unit
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. RECEIPTS TABLE
CREATE TABLE public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL UNIQUE,
    customer_name TEXT DEFAULT 'Walk-in Customer',
    customer_phone TEXT,
    customer_email TEXT,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'cash', -- cash, card, upi, net_banking, etc.
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. RECEIPT ITEMS TABLE
CREATE TABLE public.receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES public.receipts(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL, -- Store item name at time of sale
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    price_inr DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Price in INR at time of sale
    line_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. INDEXES FOR PERFORMANCE
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_name ON public.items(name);
CREATE INDEX idx_items_sku ON public.items(sku);
CREATE INDEX idx_items_barcode ON public.items(barcode);

CREATE INDEX idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX idx_receipts_number ON public.receipts(receipt_number);
CREATE INDEX idx_receipts_customer ON public.receipts(customer_name);
CREATE INDEX idx_receipts_created_at ON public.receipts(created_at);

CREATE INDEX idx_receipt_items_receipt_id ON public.receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_item_id ON public.receipt_items(item_id);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items
CREATE POLICY "Users can view their own items" ON public.items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON public.items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for receipts
CREATE POLICY "Users can view their own receipts" ON public.receipts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts" ON public.receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts" ON public.receipts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts" ON public.receipts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for receipt_items
CREATE POLICY "Users can view receipt items for their receipts" ON public.receipt_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.receipts 
            WHERE receipts.id = receipt_items.receipt_id 
            AND receipts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert receipt items for their receipts" ON public.receipt_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.receipts 
            WHERE receipts.id = receipt_items.receipt_id 
            AND receipts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update receipt items for their receipts" ON public.receipt_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.receipts 
            WHERE receipts.id = receipt_items.receipt_id 
            AND receipts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete receipt items for their receipts" ON public.receipt_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.receipts 
            WHERE receipts.id = receipt_items.receipt_id 
            AND receipts.user_id = auth.uid()
        )
    );

-- 6. FUNCTIONS AND TRIGGERS

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for items table
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
        NEW.receipt_number := 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                             LPAD(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-generating receipt numbers
CREATE TRIGGER auto_generate_receipt_number
    BEFORE INSERT ON public.receipts
    FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();

-- 7. SAMPLE DATA (Optional - for testing)
-- INSERT INTO public.items (user_id, name, description, category, price_inr, stock_quantity, sku) VALUES
-- (auth.uid(), 'Tea Cup', 'Traditional ceramic tea cup', 'Beverages', 25.00, 50, 'TEA-CUP-001'),
-- (auth.uid(), 'Coffee Mug', 'Large coffee mug with handle', 'Beverages', 45.00, 30, 'COF-MUG-001'),
-- (auth.uid(), 'Notebook A4', '200 pages ruled notebook', 'Stationery', 150.00, 100, 'NOTE-A4-001'),
-- (auth.uid(), 'Pen Blue', 'Blue ink ballpoint pen', 'Stationery', 10.00, 200, 'PEN-BLUE-001'),
-- (auth.uid(), 'Chocolate Bar', 'Dark chocolate 100g', 'Snacks', 85.00, 75, 'CHOC-DARK-001');
