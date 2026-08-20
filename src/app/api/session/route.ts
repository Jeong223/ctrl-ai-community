import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, getSessionRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const role = await getSessionRole(
    request.cookies.get(AUTH_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
  if (!role) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }
  return NextResponse.json({
    role,
    canEdit: role === "admin",
  });
}
