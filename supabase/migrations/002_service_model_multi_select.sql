-- Remove the old single-value check constraint on service_model
-- Now stores comma-separated values like "dine_in,takeout,delivery"
alter table restaurants drop constraint if exists restaurants_service_model_check;

-- Update any existing 'hybrid' values to the multi-select equivalent
update restaurants set service_model = 'dine_in,takeout,delivery' where service_model = 'hybrid';
