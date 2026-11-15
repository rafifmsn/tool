import { describe, it, expect } from "vitest";
import {
    generateEncryptionKey,
    encryptToken,
    decryptToken,
    cleanGitHubIdentifier,
    validateAndNormalizeUrl,
} from "./security";

describe("Web Crypto Token Encryption", () => {
    it("should generate a non-extractable AES-GCM key", async () => {
        const key = await generateEncryptionKey();
        expect(key.extractable).toBe(false);
        expect(key.algorithm.name).toBe("AES-GCM");
    });

    it("should encrypt and decrypt a token with randomized IVs", async () => {
        const key = await generateEncryptionKey();
        const token = "ghp_secureTokenString1234567890abcdefghijkl";
        const first = await encryptToken(token, key);
        const second = await encryptToken(token, key);

        expect(first.iv).toBeInstanceOf(Uint8Array);
        expect(first.ciphertext).toBeInstanceOf(Uint8Array);
        expect(first.iv).not.toEqual(second.iv);
        expect(await decryptToken(first, key)).toBe(token);
        expect(await decryptToken(second, key)).toBe(token);
    });

    it("should return empty string for wrong key or invalid payloads", async () => {
        const key = await generateEncryptionKey();
        const otherKey = await generateEncryptionKey();
        const encrypted = await encryptToken("ghp_secret", key);

        expect(await decryptToken(encrypted, otherKey)).toBe("");
        expect(await decryptToken(null, key)).toBe("");
        expect(await decryptToken("", key)).toBe("");
        expect(await decryptToken({ iv: "bad", ciphertext: "bad" }, key)).toBe("");
    });
});

describe("GitHub Identifier Sanitization", () => {
    it("should strip out illegal characters and preserve valid username/repo chars", () => {
        expect(cleanGitHubIdentifier("  rafifmsn  ")).toBe("rafifmsn");
        expect(cleanGitHubIdentifier("my-awesome_repo123")).toBe("my-awesome_repo123");
        expect(cleanGitHubIdentifier("user/repo@special!#")).toBe("userrepospecial");
    });
});

describe("URL Validation and Normalization", () => {
    it("should prepend https if scheme is missing", () => {
        expect(validateAndNormalizeUrl("google.com")).toBe("https://google.com/");
        expect(validateAndNormalizeUrl("http://example.com")).toBe("http://example.com/");
    });

    it("should block invalid protocols", () => {
        expect(validateAndNormalizeUrl("javascript:alert(1)")).toBeNull();
        expect(validateAndNormalizeUrl("data:text/html,hello")).toBeNull();
        expect(validateAndNormalizeUrl("ftp://files.com")).toBeNull();
    });

    it("should handle malformed urls", () => {
        expect(validateAndNormalizeUrl("not a url")).toBeNull();
    });
});
