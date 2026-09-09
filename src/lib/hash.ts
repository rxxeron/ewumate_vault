/**
 * Computes a standard SHA-256 hex string for a given File object.
 * Uses the native browser Web Crypto API (crypto.subtle.digest).
 */
export async function computeFileHash(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Crypto subtle SHA-256 error, generating fallback hash:', err);
    return 'fb_' + file.size + '_' + file.name.replace(/[^a-zA-Z0-9]/g, '');
  }
}
