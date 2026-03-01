import type { SupabaseClient } from "@supabase/supabase-js";

/** Signed URL expiry — 1 hour. Regenerated on each server render. */
const SIGNED_URL_TTL = 3600;

/**
 * Returns a URL for a single page image.
 * Private pages get a short-lived signed URL; public/unlisted use the permanent public URL.
 */
export async function getPageImageUrl(
  supabase: SupabaseClient,
  imagePath: string,
  visibility: string
): Promise<string> {
  if (visibility === "private") {
    const { data } = await supabase.storage
      .from("journal-pages")
      .createSignedUrl(imagePath, SIGNED_URL_TTL);
    return data?.signedUrl ?? "";
  }
  const { data } = supabase.storage
    .from("journal-pages")
    .getPublicUrl(imagePath);
  return data.publicUrl;
}

/**
 * Efficiently adds image_url to a list of pages.
 * Private pages are batch-signed in a single Supabase call; others use public URLs.
 */
export async function addImageUrls<
  T extends { image_path: string; visibility: string },
>(
  supabase: SupabaseClient,
  pages: T[]
): Promise<(T & { image_url: string })[]> {
  if (pages.length === 0) return [];

  const privatePaths = pages
    .filter((p) => p.visibility === "private")
    .map((p) => p.image_path);

  const signedUrlMap: Record<string, string> = {};
  if (privatePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("journal-pages")
      .createSignedUrls(privatePaths, SIGNED_URL_TTL);
    (signedUrls ?? []).forEach(({ path, signedUrl }) => {
      if (signedUrl) signedUrlMap[path] = signedUrl;
    });
  }

  return pages.map((page) => {
    if (page.visibility === "private") {
      return { ...page, image_url: signedUrlMap[page.image_path] ?? "" };
    }
    const { data } = supabase.storage
      .from("journal-pages")
      .getPublicUrl(page.image_path);
    return { ...page, image_url: data.publicUrl };
  });
}
