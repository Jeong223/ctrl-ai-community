import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(
    request.cookies.get(AUTH_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
  if (!session) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }
  return NextResponse.json({
    role: session.role,
    memberId: session.memberId,
    canEdit: session.role === "admin" || Boolean(session.memberId),
  });
}
