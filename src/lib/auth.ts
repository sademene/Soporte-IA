// src/lib/auth.ts
import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
