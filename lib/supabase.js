import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL; // e.g., https://<project-id>.supabase.co
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Anon public key
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage(file, bucket = 'images', folder = '') {
  // Validate inputs
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file: A valid File object is required.');
  }
  if (!bucket || typeof bucket !== 'string') {
    throw new Error('Invalid bucket: A non-empty string is required.');
  }
  if (typeof folder !== 'string') {
    throw new Error('Invalid folder: A string is required.');
  }

  // Generate unique filename (timestamp + original filename)
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}_${file.name.replace(`.${fileExtension}`, '')}.${fileExtension}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600', // Cache for 1 hour
    upsert: false, // Prevent overwriting existing files
  });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  if (!urlData?.publicUrl) {
    throw new Error('Failed to retrieve public URL.');
  }

  return urlData.publicUrl;
}

export { supabase, uploadImage };