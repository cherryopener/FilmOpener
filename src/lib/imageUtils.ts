/**
 * Image Utilities for FilmOpener
 * 
 * Provides client-side resizing and compression for gear photos (cameras, lenses).
 * Resizes large images (e.g. 5-15MB DSLR/smartphone photos) down to a balanced dimension (e.g. 1000px)
 * and compresses them to JPEG (quality 0.8).
 * 
 * This reduces payload from 3~10MB down to ~40~90KB, preventing localStorage QuotaExceededError
 * and keeping Supabase database payload light, ultra-fast to load, and reliable.
 */

export interface ImageCompressionOptions {
  maxDimension?: number; // Maximum width or height in pixels (default: 1000)
  quality?: number;      // JPEG compression quality between 0.1 and 1.0 (default: 0.8)
}

export const compressImageFile = (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  const { maxDimension = 1000, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('선택된 파일이 없습니다.'));
    }

    if (!file.type.startsWith('image/')) {
      return reject(new Error('선택한 파일이 이미지 파일 형식이 아닙니다.'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('이미지 파일을 읽는 도중 오류가 발생했습니다.'));
    };

    reader.onload = (e) => {
      const src = e.target?.result;
      if (typeof src !== 'string') {
        return reject(new Error('이미지 데이터를 문자열로 변환할 수 없습니다.'));
      }

      const img = new Image();

      img.onerror = () => {
        reject(new Error('이미지를 브라우저에 로드하지 못했습니다.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new dimensions while preserving aspect ratio
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
            // Fallback: return raw Data URL if canvas context is not available
            return resolve(src);
          }

          // Use high quality image interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression failed, falling back to original data URL', err);
          resolve(src);
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
};
