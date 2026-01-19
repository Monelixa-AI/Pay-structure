import { supabaseAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(
  bucket: string,
  file: File,
  folder?: string
): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadLogo(
  file: File,
  type: 'logo' | 'logo_dark' | 'favicon'
): Promise<string | null> {
  const result = await uploadFile('branding', file, type);
  return result?.url || null;
}

export async function uploadProductImage(file: File): Promise<string | null> {
  const result = await uploadFile('products', file, 'images');
  return result?.url || null;
}
