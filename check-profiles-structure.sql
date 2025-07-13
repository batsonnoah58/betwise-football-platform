-- Check the actual structure of the profiles table
-- Run this in your Supabase SQL Editor to see what columns exist

-- Method 1: Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Method 2: Check if specific columns exist
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username'
    AND table_schema = 'public'
  ) THEN 'username EXISTS' ELSE 'username DOES NOT EXIST' END as username_check,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name'
    AND table_schema = 'public'
  ) THEN 'full_name EXISTS' ELSE 'full_name DOES NOT EXIST' END as full_name_check,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email'
    AND table_schema = 'public'
  ) THEN 'email EXISTS' ELSE 'email DOES NOT EXIST' END as email_check;

-- Method 3: Sample data from profiles table
SELECT * FROM public.profiles LIMIT 3; 