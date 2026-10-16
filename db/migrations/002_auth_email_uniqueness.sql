-- Prevent concurrent registrations with different email casing. Fail safely if
-- legacy accounts collide; an administrator must resolve ownership explicitly.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique_normalized ON profiles(lower(email));
