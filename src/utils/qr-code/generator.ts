import { loadQRCodeGenerator } from "./loader";

let qrcodeLib: any = null;

export async function renderQRCode(
  canvas: HTMLCanvasElement,
  text: string,
  isInverted = false,
): Promise<void> {
  const value = text.trim();
  if (!value) return;

  if (!qrcodeLib) {
    qrcodeLib = await loadQRCodeGenerator();
  }

  return new Promise((resolve, reject) => {
    qrcodeLib.toCanvas(
      canvas,
      value,
      {
        width: 256,
        margin: 1.5,
        color: {
          dark: isInverted ? "#fafafa" : "#000000",
          light: isInverted ? "#09090b" : "#ffffff",
        },
      },
      (err: any) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

export function downloadQRCode(
  canvas: HTMLCanvasElement,
  filename = "qrcode.png",
): void {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
