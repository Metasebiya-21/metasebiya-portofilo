import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export type PasswordHashResult = {
  salt: string;
  hash: string;
};

export async function hashPassword(password: string, salt?: string): Promise<PasswordHashResult> {
  const resolvedSalt = salt ?? randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, resolvedSalt, KEY_LENGTH)) as Buffer;
  return {
    salt: resolvedSalt,
    hash: derivedKey.toString("hex"),
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  const derived = await hashPassword(password, storedSalt);
  const left = Buffer.from(derived.hash, "hex");
  const right = Buffer.from(storedHash, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
