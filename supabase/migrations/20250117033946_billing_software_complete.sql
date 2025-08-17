-- Location: supabase/migrations/20250117033946_billing_software_complete.sql
-- Professional Billing Software MVP Schema
-- Module: Complete Billing System with Authentication
-- Dependencies: Fresh project - complete schema setup

-- 1. TYPES & ENUMS
CREATE TYPE public.user_role AS ENUM ('admin', 'accountant', 'user');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'bank_transfer', 'credit_card', 'paypal', 'stripe', 'other');
CREATE TYPE public.invoice_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE public.client_status AS ENUM ('active', 'inactive', 'blocked');

-- 2. CORE USER SYSTEM
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    company_name TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. BILLING CORE TABLES
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    status public.client_status DEFAULT 'active'::public.client_status,
    payment_terms INTEGER DEFAULT 30,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    title TEXT,
    status public.invoice_status DEFAULT 'draft'::public.invoice_status,
    priority public.invoice_priority DEFAULT 'normal'::public.invoice_priority,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    balance_due DECIMAL(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    terms TEXT,
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    method public.payment_method DEFAULT 'cash'::public.payment_method,
    reference_number TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. BUSINESS SETTINGS
CREATE TABLE public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_email TEXT,
    company_phone TEXT,
    company_address TEXT,
    company_logo_url TEXT,
    tax_number TEXT,
    currency TEXT DEFAULT 'USD',
    invoice_prefix TEXT DEFAULT 'INV',
    next_invoice_number INTEGER DEFAULT 1,
    default_payment_terms INTEGER DEFAULT 30,
    default_tax_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. ESSENTIAL INDEXES
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_company_settings_user_id ON public.company_settings(user_id);

-- 6. ENABLE RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- Pattern 1: Core user table (user_profiles)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for business tables
CREATE POLICY "users_manage_own_clients"
ON public.clients
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_payments"
ON public.payments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_company_settings"
ON public.company_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Complex relationship for invoice line items
CREATE OR REPLACE FUNCTION public.can_access_invoice_line_item(item_invoice_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = item_invoice_id AND i.user_id = auth.uid()
)
$$;

CREATE POLICY "users_manage_invoice_line_items"
ON public.invoice_line_items
FOR ALL
TO authenticated
USING (public.can_access_invoice_line_item(invoice_id))
WITH CHECK (public.can_access_invoice_line_item(invoice_id));

-- 8. BUSINESS LOGIC FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
    );
    
    -- Create default company settings
    INSERT INTO public.company_settings (user_id, company_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'));
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'User profile already exists for user %', NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Update invoice totals function
CREATE OR REPLACE FUNCTION public.update_invoice_totals(invoice_uuid UUID)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    line_subtotal DECIMAL(15,2);
    invoice_tax_rate DECIMAL(5,2);
    invoice_discount DECIMAL(15,2);
    calculated_tax DECIMAL(15,2);
    final_total DECIMAL(15,2);
    total_paid DECIMAL(15,2);
    remaining_balance DECIMAL(15,2);
BEGIN
    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(line_total), 0) INTO line_subtotal
    FROM public.invoice_line_items
    WHERE invoice_id = invoice_uuid;
    
    -- Get tax rate and discount from invoice
    SELECT tax_rate, discount_amount INTO invoice_tax_rate, invoice_discount
    FROM public.invoices
    WHERE id = invoice_uuid;
    
    -- Calculate tax amount
    calculated_tax := (line_subtotal - COALESCE(invoice_discount, 0)) * (COALESCE(invoice_tax_rate, 0) / 100);
    
    -- Calculate final total
    final_total := line_subtotal - COALESCE(invoice_discount, 0) + calculated_tax;
    
    -- Calculate total paid amount
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM public.payments
    WHERE invoice_id = invoice_uuid;
    
    -- Calculate balance due
    remaining_balance := final_total - total_paid;
    
    -- Update invoice
    UPDATE public.invoices
    SET
        subtotal = line_subtotal,
        tax_amount = calculated_tax,
        total_amount = final_total,
        paid_amount = total_paid,
        balance_due = remaining_balance,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = invoice_uuid;
END;
$$;

-- Generate next invoice number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number(company_user_id UUID)
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    invoice_prefix TEXT;
    next_number INTEGER;
    new_invoice_number TEXT;
BEGIN
    -- Get and increment next invoice number
    SELECT 
        COALESCE(cs.invoice_prefix, 'INV'),
        COALESCE(cs.next_invoice_number, 1)
    INTO invoice_prefix, next_number
    FROM public.company_settings cs
    WHERE cs.user_id = company_user_id;
    
    -- Create invoice number
    new_invoice_number := invoice_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
    
    -- Update next number
    UPDATE public.company_settings
    SET next_invoice_number = next_number + 1
    WHERE user_id = company_user_id;
    
    RETURN new_invoice_number;
END;
$$;

-- 9. TRIGGERS
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update invoice totals when line items change
CREATE OR REPLACE FUNCTION public.handle_line_item_change()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_invoice_totals(OLD.invoice_id);
        RETURN OLD;
    ELSE
        -- Calculate line total
        NEW.line_total := NEW.quantity * NEW.unit_price;
        PERFORM public.update_invoice_totals(NEW.invoice_id);
        RETURN NEW;
    END IF;
END;
$$;

CREATE TRIGGER on_line_item_change
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_line_item_change();

-- Trigger to update invoice totals when payments change
CREATE OR REPLACE FUNCTION public.handle_payment_change()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_invoice_totals(OLD.invoice_id);
        RETURN OLD;
    ELSE
        PERFORM public.update_invoice_totals(NEW.invoice_id);
        RETURN NEW;
    END IF;
END;
$$;

CREATE TRIGGER on_payment_change
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_payment_change();

-- 10. COMPLETE MOCK DATA
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    user_id UUID := gen_random_uuid();
    client1_id UUID := gen_random_uuid();
    client2_id UUID := gen_random_uuid();
    client3_id UUID := gen_random_uuid();
    invoice1_id UUID := gen_random_uuid();
    invoice2_id UUID := gen_random_uuid();
    invoice3_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@billtracker.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin", "company_name": "BillTracker Pro"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@business.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Business Owner", "role": "user", "company_name": "My Business Ltd"}'::jsonb,
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create clients
    INSERT INTO public.clients (id, user_id, name, company, email, phone, address, status, payment_terms, tags)
    VALUES
        (client1_id, user_id, 'Sarah Johnson', 'Johnson Marketing Agency', 'sarah@johnsonmarketing.com', '(555) 123-4567', 
         '123 Business Ave, Suite 100, New York, NY 10001', 'active', 30, ARRAY['VIP', 'Marketing', 'Recurring']::TEXT[]),
        (client2_id, user_id, 'Michael Chen', 'Tech Solutions Inc', 'michael@techsolutions.com', '(555) 234-5678', 
         '456 Innovation Dr, San Francisco, CA 94105', 'active', 15, ARRAY['Technology', 'Startup']::TEXT[]),
        (client3_id, user_id, 'Emily Rodriguez', 'Creative Designs Studio', 'emily@creativedesigns.com', '(555) 345-6789', 
         '789 Art Street, Austin, TX 73301', 'active', 45, ARRAY['Design', 'Creative', 'Long-term']::TEXT[]);

    -- Create invoices
    INSERT INTO public.invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, currency, notes)
    VALUES
        (invoice1_id, user_id, client1_id, 'INV-2024-001', 'paid', '2024-08-15', '2024-09-15', 'USD', 'Monthly marketing services'),
        (invoice2_id, user_id, client2_id, 'INV-2024-002', 'sent', '2024-08-20', '2024-09-05', 'USD', 'Website development project'),
        (invoice3_id, user_id, client3_id, 'INV-2024-003', 'overdue', '2024-07-30', '2024-08-30', 'USD', 'Logo design and branding');

    -- Create invoice line items
    INSERT INTO public.invoice_line_items (invoice_id, description, quantity, unit_price, sort_order)
    VALUES
        -- Invoice 1 items
        (invoice1_id, 'Social Media Management', 1.00, 1500.00, 1),
        (invoice1_id, 'Content Creation', 10.00, 100.00, 2),
        -- Invoice 2 items  
        (invoice2_id, 'Website Design', 1.00, 2500.00, 1),
        (invoice2_id, 'Frontend Development', 40.00, 75.00, 2),
        (invoice2_id, 'Backend Development', 30.00, 85.00, 3),
        -- Invoice 3 items
        (invoice3_id, 'Logo Design', 1.00, 800.00, 1),
        (invoice3_id, 'Brand Guidelines', 1.00, 400.00, 2);

    -- Create payments
    INSERT INTO public.payments (invoice_id, user_id, amount, method, payment_date, reference_number)
    VALUES
        (invoice1_id, user_id, 2500.00, 'bank_transfer', '2024-09-10', 'TXN-2024-001'),
        (invoice2_id, user_id, 1000.00, 'credit_card', '2024-08-25', 'CC-2024-002');

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Some test data already exists, skipping...';
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation error: %', SQLERRM;
END $$;