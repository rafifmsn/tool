export interface EncryptedTokenPayload {
    iv: Uint8Array;
    ciphertext: Uint8Array;
}

const AES_ALGORITHM = "AES-GCM";
const AES_KEY_LENGTH = 256;
const AES_IV_BYTES = 12;

export async function generateEncryptionKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        { name: AES_ALGORITHM, length: AES_KEY_LENGTH },
        false,
        ["encrypt", "decrypt"],
    );
}

function isEncryptedTokenPayload(value: unknown): value is EncryptedTokenPayload {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
        candidate.iv instanceof Uint8Array &&
        candidate.ciphertext instanceof Uint8Array
    );
}

export function cleanGitHubIdentifier(str: string): string {
    return str.trim().replace(/[^a-zA-Z0-9-_]/g, "");
}

export function validateAndNormalizeUrl(url: string): string | null {
    let clean = url.trim();
    
    // Check if it already has a scheme
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9.+-]*:/i.test(clean);
    
    if (hasScheme) {
        // If it has a scheme, it MUST be http:// or https://
        if (!/^https?:\/\//i.test(clean)) {
            return null;
        }
    } else {
        // If it doesn't have a scheme, prepend https://
        clean = "https://" + clean;
    }

    try {
        const parsed = new URL(clean);
        // Explicitly whitelist only secure web protocols. Prevents javascript:, data:, vbscript:, etc.
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }
        return parsed.href;
    } catch {
        return null;
    }
}

export async function encryptToken(
    token: string,
    key: CryptoKey,
): Promise<EncryptedTokenPayload> {
    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_BYTES));
    const encoded = new TextEncoder().encode(token);
    const encrypted = await crypto.subtle.encrypt(
        { name: AES_ALGORITHM, iv },
        key,
        encoded,
    );
    return {
        iv,
        ciphertext: new Uint8Array(encrypted),
    };
}

export async function decryptToken(
    payload: unknown,
    key: CryptoKey,
): Promise<string> {
    if (!isEncryptedTokenPayload(payload)) {
        return "";
    }
    try {
        const iv = new Uint8Array(payload.iv);
        const ciphertext = new Uint8Array(payload.ciphertext);
        const decrypted = await crypto.subtle.decrypt(
            { name: AES_ALGORITHM, iv },
            key,
            ciphertext,
        );
        return new TextDecoder().decode(decrypted);
    } catch {
        return "";
    }
}
