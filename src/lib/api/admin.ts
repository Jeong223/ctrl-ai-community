import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, getSession } from "@/lib/auth";

export async function getRequestSession(request: NextRequest) {
  return getSession(
    request.cookies.get(AUTH_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
}

export async function requireAdmin(request: NextRequest) {
  const session = await getRequestSession(request);
  if (session?.role === "admin") return null;
  return NextResponse.json(
    { message: session ? "관리자 권한이 필요합니다." : "인증이 필요합니다." },
    { status: session ? 403 : 401 },
  );
}

export async function requireContributor(request: NextRequest) {
  const session = await getRequestSession(request);
  if (session?.role === "member" || session?.role === "admin") return null;
  return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
}

export async function requireMemberOwner(request: NextRequest, memberId: string) {
  const session = await getRequestSession(request);
  if (session?.role === "admin" || (session?.role === "member" && session.memberId === memberId)) return null;
  return NextResponse.json(
    { message: session ? "본인의 회원정보만 수정할 수 있습니다." : "인증이 필요합니다." },
    { status: session ? 403 : 401 },
  );
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
  const status = error instanceof Error && error.name === "SupabaseConfigurationError" ? 503 : 500;
  return NextResponse.json({ message }, { status });
}
