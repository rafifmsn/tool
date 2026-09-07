export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function parseImageFilename(name: string): {
  baseName: string;
  extension: string;
} {
  const extMatch = name.match(/\.([^.]+)$/);
  const extension = extMatch ? extMatch[1] : "png";
  const rawBase = name.substring(
    0,
    name.length - (extMatch ? extMatch[0].length : 0),
  );
  const baseName = rawBase && rawBase !== "image" ? rawBase : "pasted-image";
  return { baseName, extension };
}
