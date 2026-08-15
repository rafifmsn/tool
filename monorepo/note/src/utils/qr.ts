import QRCode from "qrcode";

/**
 * Renders a standard, compliant QR Code onto a target canvas element.
 * @param canvas The HTMLCanvasElement to draw into
 * @param url The target data URL string
 * @param size Target width/height in pixels
 */
export async function generateQRToCanvas(
  canvas: HTMLCanvasElement,
  url: string,
  size: number = 160,
): Promise<string> {
  try {
    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M", // Balanced data capacity vs damage protection
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Core QR generation pipeline failure:", err);
    throw err;
  }
}
