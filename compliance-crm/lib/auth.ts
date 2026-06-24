import "server-only";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "crm_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }
  return secret;
}

/** Builds a signed session token: `<expiryTimestamp>.<hmacSignature>` */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(String(expires))
    .digest("hex");
  return `${expires}.${signature}`;
}

/** Verifies a session token's signature and expiry. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresStr, signature] = token.split(".");
  if (!expiresStr || !signature) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(expiresStr)
    .digest("hex");

  // Constant-time comparison
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Checks the submitted password against the single shared dashboard password. */
export function checkSharedPassword(password: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    throw new Error("Missing DASHBOARD_PASSWORD environment variable.");
  }
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
