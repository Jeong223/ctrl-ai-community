import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, getSessionRole } from "@/lib/auth";

export async function getRequestRole(request: NextRequest) {
  return getSessionRole(
    request.cookies.get(AUTH_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
}

export async function requireAdmin(request: NextRequest) {
  const role = await getRequestRole(request);
  if (role === "admin") return null;
  return NextResponse.json(
    { message: role ? "관리자 권한이 필요합니다." : "인증이 필요합니다." },
    { status: role ? 403 : 401 },
  );
}

export async function requireContributor(request: NextRequest) {
  const role = await getRequestRole(request);
  if (role === "member" || role === "admin") return null;
  return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
  const status = error instanceof Error && error.name === "SupabaseConfigurationError" ? 503 : 500;
  return NextResponse.json({ message }, { status });
}
