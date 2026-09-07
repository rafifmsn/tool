import { describe, test, expect } from "vitest";
import {
  formatBytes,
  parseImageFilename,
} from "../src/utils/paste-image/formatter";

describe("Paste Image Formatter Suite", () => {
  test("should format byte sizes accurately", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
  });

  test("should parse filename and extension", () => {
    expect(parseImageFilename("screenshot.png")).toEqual({
      baseName: "screenshot",
      extension: "png",
    });

    expect(parseImageFilename("my.complex.photo.jpeg")).toEqual({
      baseName: "my.complex.photo",
      extension: "jpeg",
    });

    expect(parseImageFilename("image")).toEqual({
      baseName: "pasted-image",
      extension: "png",
    });
  });
});
