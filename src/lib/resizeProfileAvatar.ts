/** load file into an Image (browser only) */
function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image'));
    };
    img.src = url;
  });
}

/**
 * scale to fit inside maxSide×maxSide, encode webp (fallback jpeg).
 * keeps aspect ratio; TipPage shows circular crop.
 */
export async function resizeProfileAvatarFile(file: File, maxSide = 400): Promise<Blob> {
  if (typeof document === 'undefined') throw new Error('resizeProfileAvatarFile is browser-only');
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file');

  const img = await loadImageFile(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (!w || !h) throw new Error('Invalid image dimensions');

  const scale = Math.min(1, maxSide / Math.max(w, h));
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image');

  ctx.drawImage(img, 0, 0, w, h);

  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (webp && webp.size > 0) return webp;

  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  if (jpeg && jpeg.size > 0) return jpeg;

  throw new Error('Could not encode image');
}
