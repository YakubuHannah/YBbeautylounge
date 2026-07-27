import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function uploadMediaFile(file: File, folder = 'products') {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    throw new Error(
      'Media storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return {
    url: data.publicUrl,
    path,
    mime_type: file.type || 'image/jpeg',
    file_size: buffer.length,
  }
}
