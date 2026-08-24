import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, keyHex] = hash.split(':');
  if (!salt || !keyHex) {
    return false;
  }

  const key = Buffer.from(keyHex, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  if (key.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(key, derivedKey);
}
