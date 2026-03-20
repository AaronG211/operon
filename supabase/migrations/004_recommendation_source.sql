-- Add data_source column to recommendations so each advice cites its origin
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS data_source text;
