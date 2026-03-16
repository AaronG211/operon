-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Restaurants
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cuisine_type text,
  location text,
  service_model text check (service_model in ('dine_in', 'takeout', 'delivery', 'hybrid')),
  seats integer,
  hours text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table restaurants enable row level security;
create policy "Users can CRUD own restaurants"
  on restaurants for all using (auth.uid() = owner_id);

-- Business Metrics
create table business_metrics (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  revenue numeric(12,2),
  orders integer,
  avg_order_value numeric(8,2),
  food_cost numeric(12,2),
  labor_cost numeric(12,2),
  fixed_cost numeric(12,2),
  delivery_share numeric(5,2),
  created_at timestamptz default now()
);

alter table business_metrics enable row level security;
create policy "Owners access own metrics"
  on business_metrics for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Menu Items
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  item_name text not null,
  category text,
  price numeric(8,2) not null,
  estimated_cost numeric(8,2),
  quantity_sold integer,
  created_at timestamptz default now()
);

alter table menu_items enable row level security;
create policy "Owners access own menu"
  on menu_items for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  source text,
  review_text text,
  rating numeric(2,1),
  review_date date,
  created_at timestamptz default now()
);

alter table reviews enable row level security;
create policy "Owners access own reviews"
  on reviews for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Reports (AI-generated)
create table reports (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  report_type text default 'health_check',
  summary jsonb not null,
  risks jsonb,
  opportunities jsonb,
  created_at timestamptz default now()
);

alter table reports enable row level security;
create policy "Owners access own reports"
  on reports for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Recommendations
create table recommendations (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references reports(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  title text not null,
  description text,
  reason text,
  category text check (category in ('quick_win', 'operational', 'strategic')),
  priority text check (priority in ('high', 'medium', 'low')),
  effort text check (effort in ('low', 'medium', 'high')),
  impact text,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table recommendations enable row level security;
create policy "Owners access own recommendations"
  on recommendations for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Chat Messages
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;
create policy "Owners access own chat"
  on chat_messages for all
  using (restaurant_id in (select id from restaurants where owner_id = auth.uid()));

-- Indexes
create index idx_business_metrics_restaurant on business_metrics(restaurant_id);
create index idx_menu_items_restaurant on menu_items(restaurant_id);
create index idx_reviews_restaurant on reviews(restaurant_id);
create index idx_reports_restaurant on reports(restaurant_id, created_at desc);
create index idx_recommendations_restaurant on recommendations(restaurant_id);
create index idx_chat_messages_restaurant on chat_messages(restaurant_id, created_at);
