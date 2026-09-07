import { loadJSQR } from "./loader";
import { decodeQRCode, invertImageData } from "./decoder";

let jsQRDec: any = null;

async function getJSQR(): Promise<any> {
  if (!jsQRDec) {
    jsQRDec = await loadJSQR();
  }
  return jsQRDec;
}

export function drawImageToCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
): ImageData {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function invertCanvasPixels(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const invertedPixels = invertImageData(imgData.data);
  const newImgData = ctx.createImageData(canvas.width, canvas.height);
  newImgData.data.set(invertedPixels);
  ctx.putImageData(newImgData, 0, 0);
  return newImgData;
}

export async function scanCanvasQR(
  canvas: HTMLCanvasElement,
  existingData?: ImageData,
): Promise<string | null> {
  const jsQR = await getJSQR();
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const imgData = existingData || ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = decodeQRCode(jsQR, imgData);
  return code?.data ?? null;
}
