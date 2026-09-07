export function downloadImage(
  img: HTMLImageElement,
  format: "png" | "jpg",
  filename = "pasted-image",
): void {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d")!;

  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mime = format === "png" ? "image/png" : "image/jpeg";
  const quality = format === "png" ? undefined : 0.95;
  const dataUrl = canvas.toDataURL(mime, quality);

  const link = document.createElement("a");
  const name = filename.trim() || "image";
  link.download = `${name}.${format}`;
  link.href = dataUrl;
  link.click();
}
