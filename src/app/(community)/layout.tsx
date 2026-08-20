import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { AUTH_COOKIE, getSession } from "@/lib/auth";

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSession(
    cookieStore.get(AUTH_COOKIE)?.value,
    process.env.AUTH_SECRET,
  );
  return (
    <SessionProvider initialRole={session?.role ?? "member"} initialMemberId={session?.memberId ?? null}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
