/**
 * Client-side image compression using the Canvas API.
 *
 * Strategy:
 *  1. Resize so the longest edge is ≤ MAX_DIMENSION (1920 px).
 *  2. Export as JPEG at 80% quality.
 *  3. If the result still exceeds TARGET_SIZE, reduce quality in steps
 *     until it fits or a minimum quality floor is reached.
 *
 * This is the same approach used by most platforms (Airbnb, Zillow, etc.)
 * and keeps photos sharp on any screen while dramatically cutting file size.
 */

const MAX_DIMENSION = 1920;
const TARGET_SIZE = 2 * 1024 * 1024; // 2 MB
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

const LOGO_MAX_DIMENSION = 512;
const LOGO_TARGET_SIZE = 200 * 1024; // 200 KB
const LOGO_INITIAL_QUALITY = 0.85;

/**
 * Compress an image File, returning a new File ≤ ~2 MB.
 * If the original is already small enough, it's returned unchanged.
 */
export async function compressImage(file: File): Promise<File> {
  // Skip non-raster formats (shouldn't happen, but guard)
  if (!file.type.startsWith("image/")) return file;

  // If already under target, skip compression
  if (file.size <= TARGET_SIZE) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculate scaled dimensions
  let newWidth = width;
  let newHeight = height;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  // Draw to an OffscreenCanvas (or regular canvas as fallback)
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  // Iteratively compress until we're under TARGET_SIZE
  let quality = INITIAL_QUALITY;
  let blob: Blob | null = null;

  while (quality >= MIN_QUALITY) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= TARGET_SIZE) break;
    quality -= QUALITY_STEP;
  }

  // Final fallback — use whatever we got
  if (!blob) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", MIN_QUALITY)
    );
  }
  if (!blob) return file; // shouldn't happen

  // Build a new File with a .jpg extension
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

/**
 * Compress a logo image to ≤ 200 KB at max 512px.
 * If already under the target, it's returned unchanged.
 */
export async function compressLogo(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= LOGO_TARGET_SIZE) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let newWidth = width;
  let newHeight = height;
  if (width > LOGO_MAX_DIMENSION || height > LOGO_MAX_DIMENSION) {
    const ratio = Math.min(LOGO_MAX_DIMENSION / width, LOGO_MAX_DIMENSION / height);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  let quality = LOGO_INITIAL_QUALITY;
  let blob: Blob | null = null;

  while (quality >= MIN_QUALITY) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= LOGO_TARGET_SIZE) break;
    quality -= QUALITY_STEP;
  }

  if (!blob) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", MIN_QUALITY)
    );
  }
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
