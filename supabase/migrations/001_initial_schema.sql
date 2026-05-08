-- ============================================
-- MedPOS Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================

create extension if not exists "uuid-ossp";

-- TENANTS
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null,
  owner_name text not null,
  email text not null unique,
  phone text,
  address text,
  city text,
  plan text not null default 'starter' check (plan in ('starter', 'professional', 'business')),
  status text not null default 'trial' check (status in ('trial', 'active', 'expired', 'suspended')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PROFILES (linked to Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  full_name text not null,
  role text not null default 'cashier' check (role in ('super_admin', 'owner', 'admin', 'pharmacist', 'cashier')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STORE SETTINGS (one per tenant)
create table store_settings (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid unique not null references tenants(id) on delete cascade,
  logo_url text,
  theme text default 'light',
  receipt_header text,
  receipt_footer text,
  gst_rate numeric(5,2) default 0,
  currency text default 'PKR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEDICINES (global DB)
create table medicines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  generic_name text,
  brand text,
  category text,
  form text,
  strength text,
  manufacturer text,
  unit text,
  drap_mrp numeric(10,2),
  scope text not null default 'global' check (scope in ('global', 'private', 'pending_review')),
  is_controlled boolean default false,
  submitted_by uuid references profiles(id),
  tenant_id uuid references tenants(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STORE MEDICINES (per-store inventory)
create table store_medicines (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  medicine_id uuid not null references medicines(id),
  batch_number text,
  expiry_date date,
  stock_qty integer not null default 0,
  purchase_price numeric(10,2) not null,
  sale_price numeric(10,2) not null,
  reorder_level integer default 10,
  barcode text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CUSTOMERS (per store)
create table customers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  address text,
  cnic text,
  credit_balance numeric(10,2) default 0,
  total_spent numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SUPPLIERS (per store)
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  ntn text,
  balance_due numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SALES
create table sales (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id uuid references customers(id),
  sold_by uuid references profiles(id),
  invoice_number text not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null,
  payment_method text default 'cash' check (payment_method in ('cash', 'card', 'easypaisa', 'jazzcash')),
  status text default 'completed' check (status in ('completed', 'refunded', 'partial')),
  notes text,
  created_at timestamptz default now()
);

-- SALE ITEMS
create table sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid not null references sales(id) on delete cascade,
  store_medicine_id uuid not null references store_medicines(id),
  medicine_name text not null,
  qty integer not null,
  unit_price numeric(10,2) not null,
  discount numeric(10,2) default 0,
  subtotal numeric(10,2) not null
);

-- PRICE CHANGE LOG
create table price_change_log (
  id uuid primary key default uuid_generate_v4(),
  medicine_id uuid references medicines(id),
  old_price numeric(10,2),
  new_price numeric(10,2),
  changed_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table tenants enable row level security;
alter table profiles enable row level security;
alter table store_settings enable row level security;
alter table store_medicines enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table medicines enable row level security;

create policy "profiles_tenant_isolation" on profiles
  for all using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "store_settings_tenant_isolation" on store_settings
  for all using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "store_medicines_tenant_isolation" on store_medicines
  for all using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "customers_tenant_isolation" on customers
  for all using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "suppliers_tenant_isolation" on suppliers
  for all using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "sales_tenant_isolation" on sales
  for all using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "sale_items_tenant_isolation" on sale_items
  for all using (
    sale_id in (select id from sales where tenant_id = (
      select tenant_id from profiles where id = auth.uid()
    ))
  );

create policy "medicines_read_all" on medicines
  for select using (scope = 'global' or tenant_id = (
    select tenant_id from profiles where id = auth.uid()
  ));

create policy "medicines_write_super_admin" on medicines
  for insert with check (
    (select role from profiles where id = auth.uid()) in ('super_admin', 'owner', 'admin', 'pharmacist')
  );

-- ============================================
-- INDEXES
-- ============================================
create index idx_store_medicines_tenant on store_medicines(tenant_id);
create index idx_store_medicines_expiry on store_medicines(expiry_date);
create index idx_sales_tenant on sales(tenant_id);
create index idx_sales_created on sales(created_at);
create index idx_profiles_tenant on profiles(tenant_id);
create index idx_medicines_name on medicines using gin(to_tsvector('english', name));
create index idx_medicines_scope on medicines(scope);
