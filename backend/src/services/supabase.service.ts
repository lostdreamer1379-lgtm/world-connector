import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ARTWORK_BUCKET = process.env.SUPABASE_ARTWORK_BUCKET ?? "world-artwork";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase.service] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. " +
      "Auth verification and artwork uploads will fail until these are configured in backend/.env"
  );
}

// Server-side client using the service role key. Never send this key to
// the frontend — it bypasses row-level security.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Verifies a Supabase Auth access token (as sent by the frontend in the
 * Authorization header) and returns the associated user, or null if the
 * token is missing/invalid/expired.
 */
export async function verifySupabaseToken(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Uploads artwork for a world to Supabase Storage and returns its public URL.
 */
export async function uploadWorldArtwork(params: {
  slug: string;
  fileBuffer: Buffer;
  contentType: string;
  originalFilename: string;
}) {
  const { slug, fileBuffer, contentType, originalFilename } = params;
  const extension = originalFilename.split(".").pop() || "png";
  const path = `${slug}/${Date.now()}.${extension}`;

  const { error } = await supabaseAdmin.storage
    .from(ARTWORK_BUCKET)
    .upload(path, fileBuffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Artwork upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(ARTWORK_BUCKET).getPublicUrl(path);

  return publicUrlData.publicUrl;
}
