import { formatBytes, parseImageFilename } from "./formatter";

export interface ImageFileMetadata {
  file: File;
  dataUrl: string;
  img: HTMLImageElement;
  width: number;
  height: number;
  dimensions: string;
  sizeText: string;
  mime: string;
  baseName: string;
  extension: string;
}

export function readImageFile(file: File): Promise<ImageFileMetadata> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Invalid file type. Please select or paste an image."));
      return;
    }

    const { baseName, extension } = parseImageFilename(file.name);
    const sizeText = formatBytes(file.size);
    const mime = file.type;

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const dimensions = `${width} × ${height} px`;
        resolve({
          file,
          dataUrl,
          img,
          width,
          height,
          dimensions,
          sizeText,
          mime,
          baseName,
          extension,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
