import "server-only";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

function getRequestAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "local";
}

/**
 * 같은 접속 위치를 구분하기 위한 짧은 표시입니다.
 * 원본 IP는 반환하거나 데이터베이스에 저장하지 않습니다.
 */
export function createWriterTag(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("서버 인증 환경변수가 설정되지 않았습니다.");
  return createHmac("sha256", secret)
    .update(`ctrl-ai-writer:${getRequestAddress(request)}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
}
