import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

type TokenPayload = {
  email: string;
  exp: number;
  sig: string;
};

function getSecret(): string {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      'PASSWORD_RESET_SECRET (or ADMIN_SESSION_SECRET as a fallback) must be set to generate password reset tokens.',
    );
  }

  return secret;
}

export function createPasswordResetToken(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const exp = Date.now() + TOKEN_EXPIRY_MS;
  const sig = createHmac('sha256', getSecret())
    .update(`${normalizedEmail}:${exp}`)
    .digest('hex');

  const payload: TokenPayload = { email: normalizedEmail, exp, sig };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyPasswordResetToken(token: string): { email: string } | null {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf-8');
    const payload: TokenPayload = JSON.parse(json);

    if (!payload.email || typeof payload.exp !== 'number' || !payload.sig) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    const expectedSig = createHmac('sha256', getSecret())
      .update(`${payload.email}:${payload.exp}`)
      .digest('hex');

    const expected = Buffer.from(expectedSig, 'hex');
    const actual = Buffer.from(payload.sig, 'hex');

    if (expected.length !== actual.length) {
      return null;
    }

    if (!timingSafeEqual(expected, actual)) {
      return null;
    }

    return { email: payload.email };
  } catch {
    return null;
  }
}
