const DEFAULT_MAX_EDGE = 1200;
const DEFAULT_JPEG_QUALITY = 0.85;

export type ResizedImage = {
  blob: Blob;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  byteLength: number;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not process image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Downscale large photos before upload; keeps aspect ratio. */
export async function resizeImageFileForUpload(
  file: File,
  maxEdge = DEFAULT_MAX_EDGE,
): Promise<ResizedImage> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image.");
  }
  ctx.drawImage(img, 0, 0, width, height);

  const sourceType = file.type;
  if (sourceType === "image/png") {
    const blob = await canvasToBlob(canvas, "image/png");
    return { blob, contentType: "image/png", byteLength: blob.size };
  }
  if (sourceType === "image/webp") {
    const blob = await canvasToBlob(canvas, "image/webp", DEFAULT_JPEG_QUALITY);
    return { blob, contentType: "image/webp", byteLength: blob.size };
  }

  const blob = await canvasToBlob(canvas, "image/jpeg", DEFAULT_JPEG_QUALITY);
  return { blob, contentType: "image/jpeg", byteLength: blob.size };
}

export async function fileToArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}
