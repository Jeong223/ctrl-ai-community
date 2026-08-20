"use client";

import { ArrowRight, BookOpen, KeyRound, LockKeyhole, Sparkles, Workflow } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Logo } from "@/components/ui/logo";

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message ?? "인증 중 문제가 발생했습니다.");
        return;
      }
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="invite-form-card">
      <div className="mobile-logo"><Logo /></div>
      <h2>워크스페이스 입장</h2>
      <p>안내받은 개인 회원 코드 또는 관리자 접속코드를 입력해 주세요.</p>
      <form onSubmit={submit}>
        <label className="invite-input-wrap">
          <span className="sr-only">초대번호</span>
          <KeyRound size={19} aria-hidden="true" />
          <input
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="개인 회원 또는 관리자 접속코드"
            autoComplete="one-time-code"
            required
            autoFocus
          />
        </label>
        <button className="invite-submit" type="submit" disabled={loading || !code.trim()}>
          {loading ? "확인하고 있어요…" : "워크스페이스 입장"} {!loading && <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle", marginLeft: 5 }} />}
        </button>
        {error && <p className="invite-error" role="alert">{error}</p>}
      </form>
      <div className="invite-security">
        <LockKeyhole size={17} aria-hidden="true" />
        <span>회원은 콘텐츠를 조회·작성하고 자신의 프로필을 수정할 수 있습니다. 관리자는 전체 편집이 가능하며 인증은 7일간 유지됩니다.</span>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <main className="invite-page">
      <section className="invite-brand">
        <Logo />
        <div className="invite-message">
          <p className="eyebrow">Learn · Share · Build</p>
          <h1>AI를 함께 배우고,<br /><em>가능성을 현실로.</em></h1>
          <p>Ctrl + AI는 다양한 직무의 동료가 AI 활용 경험을 나누고, 작지만 쓸모 있는 프로젝트를 함께 만드는 커뮤니티입니다.</p>
        </div>
        <div className="invite-features" aria-label="주요 기능">
          <span><BookOpen size={13} /> 지식과 활용 사례 공유</span>
          <span><Workflow size={13} /> 미니 프로젝트 협업</span>
          <span><Sparkles size={13} /> 함께 성장하는 커뮤니티</span>
        </div>
      </section>
      <section className="invite-form-side">
        <Suspense fallback={<p>입장 화면을 준비하고 있어요…</p>}><InviteForm /></Suspense>
      </section>
    </main>
  );
}
