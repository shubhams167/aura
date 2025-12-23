-- Migration: Simplify user_profiles to use single ID (NextAuth user.id)
-- This migration consolidates id and user_id into a single id column

-- Step 1: Drop the foreign key constraint on broker_credentials FIRST
ALTER TABLE broker_credentials DROP CONSTRAINT IF EXISTS broker_credentials_user_id_user_profiles_user_id_fk;

-- Step 2: Drop the unique constraint on user_profiles.user_id (with CASCADE to drop dependent objects)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_unique CASCADE;

-- Step 3: Create a new temporary column for the new id in user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS new_id TEXT;

-- Step 4: Copy user_id values to new_id
UPDATE user_profiles SET new_id = user_id WHERE new_id IS NULL;

-- Step 5: Drop old primary key constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_pkey CASCADE;

-- Step 6: Drop the old id column (UUID) and user_id column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS id;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS user_id;

-- Step 7: Rename new_id to id and make it primary key
ALTER TABLE user_profiles RENAME COLUMN new_id TO id;
ALTER TABLE user_profiles ADD PRIMARY KEY (id);

-- Step 8: Change broker_credentials.id from uuid to text
ALTER TABLE broker_credentials ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 9: Add back the foreign key constraint on broker_credentials referencing new id column
ALTER TABLE broker_credentials
  ADD CONSTRAINT broker_credentials_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
