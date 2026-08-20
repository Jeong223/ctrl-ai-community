import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, getSession } from "@/lib/auth";

const publicPaths = ["/invite", "/api/invite", "/api/logout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const session = await getSession(
    request.cookies.get(AUTH_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );

  if (pathname === "/invite" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!isPublic && !session) {
    const inviteUrl = new URL("/invite", request.url);
    inviteUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(inviteUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
