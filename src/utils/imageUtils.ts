/**
 * Reads an image file from the user's local device, resizes it to a maximum dimension
 * (e.g. 1280px), and compresses it into a high-fidelity, lightweight Base64 JPEG Data URL.
 * 
 * This ensures:
 * 1. 5MB-10MB phone camera shots are converted to ~150KB-250KB before sending.
 * 2. Instant live UI previews without waiting for network roundtrips.
 * 3. 100% database persistence in Neon PostgreSQL with zero risk of ephemeral disk data loss.
 */
export async function fileToCompressedBase64(
  file: File,
  maxDimension = 1280,
  quality = 0.85
): Promise<string> {
  // Validate that the file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the selected file from your device.'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to process the image data.'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to raw data url if canvas context is unavailable
          resolve(reader.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Formats raw file size in bytes to human-readable text (e.g. 245 KB, 1.2 MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
