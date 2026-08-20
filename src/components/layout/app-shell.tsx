"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Home,
  Info,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { CommunityProvider } from "@/components/providers/community-provider";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/format";

const navigation = [
  { href: "/", label: "대시보드", icon: Home },
  { href: "/notices", label: "공지사항", icon: Bell },
  { href: "/knowledge", label: "정보공유", icon: BookOpen },
  { href: "/projects", label: "프로젝트", icon: Workflow },
  { href: "/gatherings", label: "모임 일정", icon: CalendarDays },
  { href: "/members", label: "회원", icon: Users },
  { href: "/about", label: "동호회 소개", icon: Info },
];

function ThemeButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("ctrl-ai-theme");
    const nextDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    queueMicrotask(() => setDark(nextDark));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("ctrl-ai-theme", next ? "dark" : "light");
  }

  return (
    <button className="icon-button" onClick={toggle} type="button" aria-label={dark ? "라이트 모드" : "다크 모드"}>
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="main-nav" aria-label="주요 메뉴">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn("nav-link", active && "is-active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} />
            <span>{label}</span>
            {active && <ChevronRight className="nav-chevron" size={16} />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFocus() {
  const { data } = useCommunity();
  return (
    <div className="sidebar-note">
      <span>이번 달의 포커스</span>
      <strong>{data.dashboard.monthlyFocus}</strong>
      <div><i style={{ width: "42%" }} /></div>
      <small>3개 팀 중 1개 팀 진행 중</small>
    </div>
  );
}

function DataStatus() {
  const { loading, saving, feedback, clearFeedback } = useCommunity();
  if (!loading && !saving && !feedback) return null;
  return (
    <div className={`data-status ${feedback?.tone === "error" ? "is-error" : feedback?.tone === "success" ? "is-success" : ""}`} role={feedback?.tone === "error" ? "alert" : "status"}>
      <span>{loading ? "공용 데이터를 불러오는 중입니다…" : saving ? "공용 DB에 저장하는 중입니다…" : feedback?.text}</span>
      {feedback && !loading && !saving && <button type="button" onClick={clearFeedback} aria-label="알림 닫기">×</button>}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { role, isAdmin } = useSession();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/invite");
    router.refresh();
  }

  return (
    <CommunityProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <Logo />
          <div className="workspace-chip">
            <span className="workspace-avatar">C</span>
            <span><strong>Ctrl + AI</strong><small>멤버 워크스페이스</small></span>
          </div>
          <NavLinks />
          <div className="sidebar-footer">
            <SidebarFocus />
            <button type="button" className="logout-button" onClick={logout}>
              <LogOut size={18} /> 인증 초기화
            </button>
          </div>
        </aside>

        <div className="app-main">
          <header className="topbar">
            <button className="icon-button mobile-only" type="button" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기">
              <Menu size={21} />
            </button>
            <div className="topbar-search">
              <Search size={17} />
              <span>정보, 공지, 프로젝트를 빠르게 찾아보세요</span>
              <kbd>⌘ K</kbd>
            </div>
            <div className="topbar-actions">
              <span className={`role-badge ${isAdmin ? "is-admin" : ""}`}>
                <ShieldCheck size={14} /> {isAdmin ? "관리자 편집 모드" : "회원 참여 모드"}
              </span>
              <ThemeButton />
              <span className="profile-avatar" title={isAdmin ? "Ctrl + AI 관리자" : "Ctrl + AI 회원"}>{role === "admin" ? "AD" : "AI"}</span>
            </div>
          </header>
          <DataStatus />
          <main className="content">{children}</main>
        </div>

        {menuOpen && (
          <div className="mobile-menu-backdrop" onMouseDown={() => setMenuOpen(false)}>
            <aside className="mobile-menu" onMouseDown={(event) => event.stopPropagation()}>
              <div className="mobile-menu-header">
                <Logo />
                <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
                  <X size={20} />
                </button>
              </div>
              <NavLinks onNavigate={() => setMenuOpen(false)} />
              <button type="button" className="logout-button" onClick={logout}>
                <LogOut size={18} /> 인증 초기화
              </button>
            </aside>
          </div>
        )}
      </div>
    </CommunityProvider>
  );
}
