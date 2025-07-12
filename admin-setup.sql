-- Admin Setup Script
-- Run this in your Supabase SQL Editor to grant admin access

-- Step 1: Find your user ID (replace 'your-email@example.com' with your actual email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Insert admin role for your user (replace 'your-user-id' with the ID from step 1)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('your-user-id', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify the admin role was added
SELECT 
  p.full_name,
  ur.role
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin';

-- Alternative: Grant admin to all users (for testing only - remove in production)
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users
-- ON CONFLICT (user_id, role) DO NOTHING; 