import { createClient } from "@/lib/supabase/server";

// ============================================================================
// SUPABASE STORAGE UTILITIES
// ============================================================================
// Upload screenshots to permanent storage

const BUCKET_NAME = "screenshots";

/**
 * Upload a screenshot from an external URL to Supabase Storage
 * Returns the permanent public URL
 */
export async function uploadScreenshot(
  imageUrl: string,
  bookmarkId: string
): Promise<string | null> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const fileName = `${bookmarkId}.jpg`;

    const supabase = await createClient();

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error(`Failed to upload screenshot for ${bookmarkId}:`, error);
    return null;
  }
}

/**
 * Delete a screenshot from Supabase Storage
 */
export async function deleteScreenshot(bookmarkId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${bookmarkId}.jpg`]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Failed to delete screenshot for ${bookmarkId}:`, error);
    return false;
  }
}

/**
 * Get the public URL for a stored screenshot
 */
export async function getScreenshotStorageUrl(
  bookmarkId: string
): Promise<string> {
  const supabase = await createClient();
  
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${bookmarkId}.jpg`);

  return publicUrl;
}
