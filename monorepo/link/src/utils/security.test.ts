import { describe, it, expect } from "vitest";
import {
    encryptToken,
    decryptToken,
    cleanGitHubIdentifier,
    validateAndNormalizeUrl,
} from "./security";

describe("Security Obfuscation Layer", () => {
    it("should successfully encrypt and decrypt a token symmetrically", () => {
        const token = "ghp_secureTokenString1234567890abcdefghijkl";
        const encrypted = encryptToken(token);
        
        expect(encrypted).not.toBe(token);
        expect(decryptToken(encrypted)).toBe(token);
    });

    it("should handle empty strings for encryption/decryption gracefully", () => {
        expect(decryptToken("")).toBe("");
        expect(decryptToken("invalid-base64-string!")).toBe("");
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
