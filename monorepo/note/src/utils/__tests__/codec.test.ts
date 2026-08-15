import { describe, it, expect } from 'vitest';
import { encodeContent, decodeContent } from '../codec';

describe('codec utilities', () => {
  it('should return empty string for empty inputs', async () => {
    expect(await encodeContent('')).toBe('');
    expect(await decodeContent('')).toBe('');
  });

  it('should compress and encode basic ASCII string', async () => {
    const raw = 'hello world';
    const encoded = await encodeContent(raw);
    
    // Assert encoding structure is URL-safe base64 (no +, /, or =)
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');

    // Decode and verify roundtrip
    const decoded = await decodeContent(encoded);
    expect(decoded).toBe(raw);
  });

  it('should correctly handle multi-byte Unicode characters (Emojis)', async () => {
    const raw = 'Hello 🍕, how is the weather in 🇯🇵?';
    const encoded = await encodeContent(raw);
    const decoded = await decodeContent(encoded);
    expect(decoded).toBe(raw);
  });

  it('should handle complex multi-line markdown notes with special symbols', async () => {
    const raw = `# Markdown Note

This is a test note containing:
- Lists
- **Bold text**
- _Italics_
- Equations like $E = mc^2$
- Custom characters like <, >, &, ", and '

Hope it works!`;

    const encoded = await encodeContent(raw);
    const decoded = await decodeContent(encoded);
    expect(decoded).toBe(raw);
  });
});
