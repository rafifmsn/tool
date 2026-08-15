/**
 * Compresses a UTF-8 string using GZIP and encodes it into a URL-safe Base64 string.
 */
export async function encodeContent(str: string): Promise<string> {
  if (!str) return "";

  // 1. Convert text to binary stream
  const textEncoder = new TextEncoder();
  const rawBytes = textEncoder.encode(str);

  // 2. Compress via native browser GZIP stream
  const blob = new Blob([rawBytes]);
  const compressionStream = new CompressionStream("gzip");
  const compressedStream = blob.stream().pipeThrough(compressionStream);
  const compressedResponse = new Response(compressedStream);
  const buffer = await compressedResponse.arrayBuffer();

  // 3. Translate binary buffer safe to Base64
  const binaryString = Array.from(new Uint8Array(buffer), (byte) =>
    String.fromCharCode(byte),
  ).join("");
  return btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Strip padding tokens safely
}

/**
 * Decodes a URL-safe compressed Base64 string back into native UTF-8 plain text.
 */
export async function decodeContent(base64: string): Promise<string> {
  if (!base64) return "";

  // 1. Restore standard Base64 string padding
  let standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
  while (standardBase64.length % 4) {
    standardBase64 += "=";
  }

  // 2. Decode Base64 to binary byte layout
  const binaryString = atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 3. Decompress the GZIP binary packet
  const blob = new Blob([bytes]);
  const decompressionStream = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(decompressionStream);
  const decompressedResponse = new Response(decompressedStream);
  const buffer = await decompressedResponse.arrayBuffer();

  return new TextDecoder().decode(buffer);
}
