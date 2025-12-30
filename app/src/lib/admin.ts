import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function adminCookieName(): string {
  return COOKIE_NAME;
}

export function createAdminToken(): string {
  const secret = getSecret();
  if (!secret) return "";

  const value = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${signature}`;
}

export function isAdminTokenValid(token?: string): boolean {
  const secret = getSecret();
  if (!token || !secret) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  const expected = createHmac("sha256", secret).update(value).digest("hex");
  if (signature.length !== expected.length) return false;

  return timingSafeEqual(
    Buffer.from(signature, "utf8"),
    Buffer.from(expected, "utf8")
  );
}
