-- Add latitude and longitude to restaurants for location-based analysis
ALTER TABLE restaurants
  ADD COLUMN latitude numeric(10,7),
  ADD COLUMN longitude numeric(10,7);
