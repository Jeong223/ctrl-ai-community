import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, createSessionToken, safeCodeEqual, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { findMemberByPersonalCode } from "@/lib/supabase/community-repository";

export async function POST(request: NextRequest) {
  const inviteCode = process.env.INVITE_CODE;
  const memberPinSuffix = process.env.MEMBER_PIN_SUFFIX || inviteCode;
  const adminCode = process.env.ADMIN_ACCESS_CODE;
  const authSecret = process.env.AUTH_SECRET;
  if (!inviteCode || !adminCode || !authSecret || inviteCode === adminCode) {
    return NextResponse.json(
      { message: "서버의 접속코드 설정을 확인해 주세요." },
      { status: 503 },
    );
  }

  let code = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  let role: "member" | "admin" | null = null;
  let memberId: string | null = null;
  if (code && safeCodeEqual(code, adminCode)) {
    role = "admin";
  } else if (code && safeCodeEqual(code, inviteCode)) {
    role = "member";
  } else if (code && memberPinSuffix) {
    try {
      const member = await findMemberByPersonalCode(code, memberPinSuffix);
      if (member) {
        role = "member";
        memberId = member.id;
      }
    } catch {
      return NextResponse.json({ message: "회원 정보를 확인할 수 없습니다." }, { status: 503 });
    }
  }

  if (!role) {
    return NextResponse.json({ message: "접속코드가 일치하지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role });
  response.cookies.set(AUTH_COOKIE, await createSessionToken(authSecret, role, memberId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
