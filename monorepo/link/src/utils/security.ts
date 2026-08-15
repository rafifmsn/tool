export const OBS_KEY = "x7f9a2b4c6d8e0f1_link";

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

export function encryptToken(token: string): string {
    let xor = "";
    for (let i = 0; i < token.length; i++) {
        xor += String.fromCharCode(
            token.charCodeAt(i) ^ OBS_KEY.charCodeAt(i % OBS_KEY.length),
        );
    }
    return btoa(xor);
}

export function decryptToken(encrypted: string): string {
    try {
        const decoded = atob(encrypted);
        let xor = "";
        for (let i = 0; i < decoded.length; i++) {
            xor += String.fromCharCode(
                decoded.charCodeAt(i) ^
                    OBS_KEY.charCodeAt(i % OBS_KEY.length),
            );
        }
        return xor;
    } catch {
        return "";
    }
}
