export function invertImageData(data: Uint8ClampedArray): Uint8ClampedArray {
  const inverted = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    inverted[i] = 255 - data[i]; // R
    inverted[i + 1] = 255 - data[i + 1]; // G
    inverted[i + 2] = 255 - data[i + 2]; // B
    inverted[i + 3] = data[i + 3]; // Alpha unchanged
  }
  return inverted;
}

export interface QRDecodeResult {
  data: string;
  location?: any;
}

export function decodeQRCode(
  jsQR: any,
  imageData: { data: Uint8ClampedArray; width: number; height: number },
): QRDecodeResult | null {
  if (!jsQR || !imageData || imageData.width <= 0 || imageData.height <= 0) {
    return null;
  }

  // 1. Primary decode attempt with both standard and inverted attempts enabled in jsQR
  const primaryResult = jsQR(
    imageData.data,
    imageData.width,
    imageData.height,
    {
      inversionAttempts: "attemptBoth",
    },
  );

  if (primaryResult && primaryResult.data) {
    return primaryResult;
  }

  // 2. Fallback attempt: explicitly invert pixel RGB values
  const invertedPixels = invertImageData(imageData.data);
  const fallbackResult = jsQR(
    invertedPixels,
    imageData.width,
    imageData.height,
    {
      inversionAttempts: "dontInvert",
    },
  );

  if (fallbackResult && fallbackResult.data) {
    return fallbackResult;
  }

  return null;
}
