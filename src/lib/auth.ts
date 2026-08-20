const encoder = new TextEncoder();

export const AUTH_COOKIE = "ctrl_ai_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export type SessionRole = "member" | "admin";
export type SessionIdentity = {
  role: SessionRole;
  memberId: string | null;
};

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

function isValidMemberId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isFreshTimestamp(issuedAt: string) {
  const timestamp = Number(issuedAt);
  const now = Math.floor(Date.now() / 1000);
  return Number.isFinite(timestamp)
    && timestamp <= now + 60
    && now - timestamp <= SESSION_MAX_AGE_SECONDS;
}

export async function createSessionToken(
  secret: string,
  role: SessionRole,
  memberId: string | null = null,
) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const subject = role === "member" && memberId ? memberId : "-";
  const payload = `${issuedAt}.${role}.${subject}`;
  return `${payload}.${await sign(payload, secret)}`;
}

export async function getSession(
  token: string | undefined,
  secret: string | undefined,
): Promise<SessionIdentity | null> {
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3 && parts.length !== 4) return null;
  const [issuedAt, role] = parts;
  if (!issuedAt || (role !== "member" && role !== "admin") || !isFreshTimestamp(issuedAt)) return null;

  if (parts.length === 3) {
    const signature = parts[2];
    const payload = `${issuedAt}.${role}`;
    return signature && safeEqual(signature, await sign(payload, secret))
      ? { role, memberId: null }
      : null;
  }

  const subject = parts[2];
  const signature = parts[3];
  const memberId = subject === "-" ? null : subject;
  if (!signature || (memberId && !isValidMemberId(memberId)) || (role === "admin" && memberId)) return null;
  const payload = `${issuedAt}.${role}.${subject}`;
  return safeEqual(signature, await sign(payload, secret)) ? { role, memberId } : null;
}

export async function getSessionRole(
  token: string | undefined,
  secret: string | undefined,
): Promise<SessionRole | null> {
  return (await getSession(token, secret))?.role ?? null;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined) {
  return (await getSession(token, secret)) !== null;
}

export function safeCodeEqual(received: string, expected: string) {
  return safeEqual(received.normalize("NFKC"), expected.normalize("NFKC"));
}
