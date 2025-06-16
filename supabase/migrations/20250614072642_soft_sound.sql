/*
  # Create White Label Logos Storage Bucket

  1. New Storage Bucket
    - Create a public storage bucket for white label logos
    - Set file size limit to 2MB
    - Restrict to image file types only
    - No direct RLS policy creation (will be handled by Supabase automatically)

  Note: This migration avoids directly modifying the storage.objects table
  or creating RLS policies, which requires owner privileges.
*/

-- Create the storage bucket for white label logos using the storage API
SELECT storage.create_bucket(
  'white-label-logos',  -- bucket id
  'White Label Logos',  -- friendly name
  'public',             -- public access level
  2097152,              -- 2MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[] -- allowed mime types
);