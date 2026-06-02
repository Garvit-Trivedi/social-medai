import { supabase } from '../lib/supabaseClient';

/**
 * Safely uploads a file to Supabase Storage.
 *
 * @param {File} file - The file object to upload.
 * @param {string} bucket - The name of the Supabase bucket.
 * @param {string} folder - Optional folder path inside the bucket.
 * @returns {Promise<{url: string | null, error: any}>}
 */
export const uploadFileToSupabase = async (file, bucket = 'uploads', folder = '') => {
  try {
    if (!file) throw new Error('No file provided');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Supabase Storage Error:', error.message);
    return { url: null, error };
  }
};
