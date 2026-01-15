import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string, role: string, secret: string): string {
  return jwt.sign(
    { userId, role, type: 'access' },
    secret,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string, secret: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string, secret: string): { userId: string; role: string } {
  const payload = jwt.verify(token, secret) as any;
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return { userId: payload.userId, role: payload.role };
}

export function verifyRefreshToken(token: string, secret: string): { userId: string } {
  const payload = jwt.verify(token, secret) as any;
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return { userId: payload.userId };
}

export function generateId(): string {
  return crypto.randomUUID();
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
