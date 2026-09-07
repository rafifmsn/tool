import { describe, test, expect } from "vitest";
import { invertImageData, decodeQRCode } from "../src/utils/qr/decoder";

describe("QR Decoder & Inverter Suite", () => {
  test("should invert RGB channels and leave Alpha intact", () => {
    // RGBA: [black, white, red, half-transparent blue]
    const original = new Uint8ClampedArray([
      0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 128,
    ]);

    const inverted = invertImageData(original);

    expect(Array.from(inverted)).toEqual([
      255,
      255,
      255,
      255, // Inverted black -> white
      0,
      0,
      0,
      255, // Inverted white -> black
      0,
      255,
      255,
      255, // Inverted red -> cyan
      255,
      255,
      0,
      128, // Inverted blue -> yellow, alpha unchanged
    ]);
  });

  test("should return decoded result on primary attempt with attemptBoth", () => {
    const mockJsQR = (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      opts: any,
    ) => {
      if (opts.inversionAttempts === "attemptBoth") {
        return { data: "https://example.com" };
      }
      return null;
    };

    const dummyImage = {
      data: new Uint8ClampedArray([0, 0, 0, 255]),
      width: 1,
      height: 1,
    };

    const result = decodeQRCode(mockJsQR, dummyImage);
    expect(result).not.toBeNull();
    expect(result?.data).toBe("https://example.com");
  });

  test("should fallback to manual pixel inversion when primary attempt returns null", () => {
    let fallbackCalledWithInvertedData = false;

    const mockJsQR = (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      opts: any,
    ) => {
      // Primary attempt fails
      if (opts.inversionAttempts === "attemptBoth") {
        return null;
      }
      // Fallback attempt succeeds and verifies pixels are inverted
      if (opts.inversionAttempts === "dontInvert") {
        if (data[0] === 255) {
          fallbackCalledWithInvertedData = true;
          return { data: "white-on-black-qr-code" };
        }
      }
      return null;
    };

    const blackPixelImage = {
      data: new Uint8ClampedArray([0, 0, 0, 255]),
      width: 1,
      height: 1,
    };

    const result = decodeQRCode(mockJsQR, blackPixelImage);
    expect(fallbackCalledWithInvertedData).toBe(true);
    expect(result).not.toBeNull();
    expect(result?.data).toBe("white-on-black-qr-code");
  });

  test("should return null for invalid or empty inputs", () => {
    const mockJsQR = () => null;
    expect(
      decodeQRCode(mockJsQR, {
        data: new Uint8ClampedArray(),
        width: 0,
        height: 0,
      }),
    ).toBeNull();
    expect(
      decodeQRCode(null, {
        data: new Uint8ClampedArray([1, 2, 3, 4]),
        width: 1,
        height: 1,
      }),
    ).toBeNull();
  });
});
