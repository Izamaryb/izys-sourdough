const ADMIN_COOKIE_NAME = 'izys_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET environment variable is not set.');
  }

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(): Promise<string> {
  const key = await getSigningKey();
  const payload = JSON.stringify({ exp: Date.now() + SESSION_DURATION_SECONDS * 1000 });
  const payloadBytes = new TextEncoder().encode(payload);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, payloadBytes);

  const payloadB64 = toBase64Url(payloadBytes);
  const signatureB64 = toBase64Url(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, signatureB64] = token.split('.');

    if (!payloadB64 || !signatureB64) {
      return false;
    }

    const key = await getSigningKey();
    const payloadBytes = fromBase64Url(payloadB64);
    const signatureBytes = fromBase64Url(signatureB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      payloadBytes as BufferSource,
    );

    if (!isValid) {
      return false;
    }

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp?: number };

    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export { ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS };
