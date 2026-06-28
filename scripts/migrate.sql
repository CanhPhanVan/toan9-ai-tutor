-- 1. Rename old admin role 'parent' -> 'admin'
UPDATE "User" SET role = 'admin' WHERE role = 'parent';

-- 2. Create demo parent account (will be done via API or separate step)
-- password hash for 'parent123' with bcrypt rounds=10
-- We'll insert via the app API instead
