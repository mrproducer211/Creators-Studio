/**
 * Client-side image optimizer that compresses images and converts them to high-efficiency WebP.
 * Helps save storage space on Cloudinary and speeds up client upload times.
 */
export async function compressAndConvertToWebp(
  file: File,
  maxDimension = 2000,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve) => {
    // Only process images
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    if (typeof window === "undefined") {
      return resolve(file);
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Downscale if image exceeds maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          // Convert blob back to a File with WebP extension
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${cleanName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => {
      resolve(file);
    };
  });
}
