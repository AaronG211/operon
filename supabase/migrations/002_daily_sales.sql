-- Daily per-item sales tracking
create table daily_sales (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  sale_date date not null,
  quantity integer not null default 0,
  revenue numeric(12,2),
  notes text,
  created_at timestamptz default now(),
  unique(menu_item_id, sale_date)
);

alter table daily_sales enable row level security;
create policy "Owners access own daily sales"
  on daily_sales for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

create index idx_daily_sales_restaurant_date on daily_sales(restaurant_id, sale_date);
create index idx_daily_sales_menu_item on daily_sales(menu_item_id, sale_date);
