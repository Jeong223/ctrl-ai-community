"use client";

import { createContext, useContext, useMemo } from "react";
import type { SessionRole } from "@/lib/auth";

type SessionContextValue = {
  role: SessionRole;
  isAdmin: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  initialRole,
  children,
}: {
  initialRole: SessionRole;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ role: initialRole, isAdmin: initialRole === "admin" }),
    [initialRole],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
