-- Upgrade existing databases as well as fresh installations. Keep existing data.
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255);
ALTER TABLE ticket_attachments ADD COLUMN IF NOT EXISTS file_data BYTEA;
ALTER TABLE ticket_ratings ADD COLUMN IF NOT EXISTS resolution_method VARCHAR(50);
