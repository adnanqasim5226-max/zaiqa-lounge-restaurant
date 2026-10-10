-- ==============================================================================
-- SAYLANI HACKATHON: SUPABASE DATABASE SETUP SCRIPT
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- Project URL: https://emlafsbmvwcsiklpxgel.supabase.co
-- ==============================================================================

-- 1. Create the 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('Asia/Karachi', now()),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    special_instructions TEXT DEFAULT '',
    dishes JSONB NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone (customers) to place/insert an order
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Policy: Allow reading orders (for customer tracking & admin dashboard)
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders"
ON public.orders
FOR SELECT
TO public
USING (true);

-- 5. Policy: Allow updating order status (Pending -> Preparing -> Delivered)
DROP POLICY IF EXISTS "Public can update order status" ON public.orders;
CREATE POLICY "Public can update order status"
ON public.orders
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 6. Insert an initial sample order so the Admin Dashboard has data right away
INSERT INTO public.orders (customer_name, customer_phone, customer_address, dishes, total_price, status)
VALUES (
    'Adnan Qasim',
    '03072820877',
    'House 12, Gulistan-e-johar, Phelwan Goth, Block-9, Karachi',
    '[{"name": "Royal Dum Biryani", "quantity": 2, "price": 650}, {"name": "Fresh Mint Lemonade Cooler", "quantity": 2, "price": 320}]'::jsonb,
    1940,
    'Pending'
);
