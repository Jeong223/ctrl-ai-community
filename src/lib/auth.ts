const encoder = new TextEncoder();

export const AUTH_COOKIE = "ctrl_ai_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export type SessionRole = "member" | "admin";

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export async function createSessionToken(secret: string, role: SessionRole) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const payload = `${issuedAt}.${role}`;
  return `${payload}.${await sign(payload, secret)}`;
}

export async function getSessionRole(
  token: string | undefined,
  secret: string | undefined,
): Promise<SessionRole | null> {
  if (!token || !secret) return null;
  const [issuedAt, role, signature, extra] = token.split(".");
  if (!issuedAt || (role !== "member" && role !== "admin") || !signature || extra) return null;
  const timestamp = Number(issuedAt);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || timestamp > now + 60 || now - timestamp > SESSION_MAX_AGE_SECONDS) {
    return null;
  }
  const valid = safeEqual(signature, await sign(`${issuedAt}.${role}`, secret));
  return valid ? role : null;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined) {
  return (await getSessionRole(token, secret)) !== null;
}

export function safeCodeEqual(received: string, expected: string) {
  return safeEqual(received.normalize("NFKC"), expected.normalize("NFKC"));
}
