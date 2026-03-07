// ─── Auth Utilities ────────────────────────────────────────────────────────────

/**
 * Read the stored token from either localStorage or sessionStorage.
 */
export const getStoredToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token') || null;

/**
 * Decode a JWT payload WITHOUT verifying the signature.
 * Verification is done server-side; we only need the `exp` claim client-side.
 *
 * @param {string} token  Raw JWT string
 * @returns {object|null} Decoded payload or null if malformed
 */
export const decodeJwt = (token) => {
    try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        // Base64URL → Base64 → atob
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
};

/**
 * Returns true if the stored token exists AND has not expired.
 * Uses the JWT `exp` claim (seconds since Unix epoch).
 *
 * @param {number} bufferSeconds  Consider the token expired this many seconds
 *                                before the real `exp`. Default: 30 s.
 */
export const isTokenValid = (bufferSeconds = 30) => {
    const token = getStoredToken();
    if (!token) return false;

    const payload = decodeJwt(token);
    if (!payload) return false;

    // If there's no `exp` claim, treat the token as always valid (some
    // implementations issue non-expiring tokens — backend handles it).
    if (!payload.exp) return true;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - bufferSeconds > nowSeconds;
};

/**
 * Returns the number of milliseconds until the token expires.
 * Returns 0 if already expired or no token present.
 */
export const msUntilExpiry = () => {
    const token = getStoredToken();
    if (!token) return 0;

    const payload = decodeJwt(token);
    if (!payload?.exp) return Infinity; // no expiry

    const expiresAt = payload.exp * 1000; // convert to ms
    return Math.max(0, expiresAt - Date.now());
};

/**
 * Clear all auth tokens from both storages.
 */
export const clearTokens = () => {
    ['token', 'refreshToken', 'user'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
};
