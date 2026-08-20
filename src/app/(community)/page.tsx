"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Clock3,
  Edit3,
  FolderKanban,
  Lightbulb,
  MapPin,
  Pin,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, Field, Modal } from "@/components/ui/primitives";
import { formatDate, sortNewest } from "@/lib/format";
import type { ProjectStatus } from "@/lib/types";

const statusTone: Record<ProjectStatus, "blue" | "violet" | "green" | "orange" | "gray"> = {
  아이디어: "orange",
  기획: "violet",
  진행중: "blue",
  완료: "green",
  보류: "gray",
};

export default function DashboardPage() {
  const { data, saveDashboard } = useCommunity();
  const { isAdmin } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.dashboard);
  const recentNotices = [...data.notices]
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const activeProjects = data.projects.filter((project) => project.status !== "완료" && project.status !== "보류");
  const recentKnowledge = sortNewest(data.knowledge).slice(0, 3);
  const upcomingMeeting = [...data.gatherings]
    .filter((gathering) => new Date(`${gathering.date}T23:59:59`) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? data.gatherings[0];
  const meetingDate = upcomingMeeting ? new Date(`${upcomingMeeting.date}T12:00:00`) : null;

  function openEditor() {
    setDraft(data.dashboard);
    setEditing(true);
  }

  async function saveCopy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await saveDashboard(draft)) setEditing(false);
  }

  return (
    <>
      <section className="dashboard-hero">
        {isAdmin && <button type="button" className="admin-hero-button" onClick={openEditor}><Edit3 size={14} /> 대시보드 문구 편집</button>}
        <div className="hero-copy">
          <span className="hero-label"><Sparkles size={13} /> {data.dashboard.kicker}</span>
          <h1>{data.dashboard.titleLine1}<br /><em>{data.dashboard.titleHighlight}</em></h1>
          <p>{data.dashboard.description}</p>
          <div className="hero-actions">
            <Link className="button" href="/projects">프로젝트 둘러보기 <ArrowRight size={15} /></Link>
            <Link className="button button-secondary" href="/knowledge">새로운 지식 보기</Link>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-core"><strong>Ctrl<br />+ AI</strong></div>
          <span className="orbit-dot one"><Lightbulb size={18} /></span>
          <span className="orbit-dot two"><Workflow size={18} /></span>
          <span className="orbit-dot three"><BookOpen size={18} /></span>
        </div>
      </section>

      <section className="stats-grid" aria-label="동호회 현황">
        <div className="card stat-card"><span className="stat-icon"><Users size={19} /></span><span><strong>{data.members.length}</strong><small>함께하는 회원</small></span></div>
        <div className="card stat-card"><span className="stat-icon"><FolderKanban size={19} /></span><span><strong>{activeProjects.length}</strong><small>활동 중인 프로젝트</small></span></div>
        <div className="card stat-card"><span className="stat-icon"><BookOpen size={19} /></span><span><strong>{data.knowledge.length}</strong><small>공유된 지식</small></span></div>
        <div className="card stat-card"><span className="stat-icon"><CalendarDays size={19} /></span><span><strong>{data.gatherings.length}</strong><small>모임과 활동 기록</small></span></div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <section>
            <div className="section-title"><h2>최근 공지</h2><Link href="/notices">전체 보기 →</Link></div>
            <div className="card notice-list">
              {recentNotices.map((notice) => (
                <Link href={`/notices/${notice.id}`} className={`notice-row ${notice.pinned ? "pinned" : ""}`} key={notice.id}>
                  <span className="notice-dot">{notice.pinned ? <Pin size={15} /> : <Bell size={15} />}</span>
                  <span>
                    <h3>{notice.title}</h3>
                    <p><Badge tone={notice.pinned ? "blue" : "gray"}>{notice.category}</Badge> · {notice.author}</p>
                  </span>
                  <span className="notice-meta">{formatDate(notice.createdAt)}</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="section-title"><h2>프로젝트 스튜디오</h2><Link href="/projects">모든 프로젝트 →</Link></div>
            <div className="project-mini-grid">
              {data.projects.slice(0, 3).map((project) => (
                <Link href={`/projects/${project.id}`} className="card card-hover project-mini" key={project.id}>
                  <div className="project-mini-top"><Badge tone={statusTone[project.status]}>{project.status}</Badge><ArrowRight size={15} color="var(--subtle)" /></div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="avatar-stack" aria-label={`팀원 ${project.members.join(", ")}`}>
                    {project.members.map((member) => <span className="mini-avatar" key={member}>{member.slice(-1)}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="dashboard-stack">
          {upcomingMeeting && meetingDate && (
            <section>
              <div className="section-title"><h2>다음 모임</h2><Link href="/gatherings">일정 보기 →</Link></div>
              <div className="card next-meeting">
                <div className="meeting-banner">
                  <div className="meeting-date">
                    <span className="date-block"><strong>{meetingDate.getDate()}</strong><small>{meetingDate.toLocaleDateString("ko-KR", { month: "short" })}</small></span>
                    <span><h3>{upcomingMeeting.title}</h3><p>{formatDate(upcomingMeeting.date)}</p></span>
                  </div>
                </div>
                <div className="meeting-details">
                  <span><Clock3 size={14} /> {upcomingMeeting.time ?? "시간 협의"}</span>
                  <span><MapPin size={14} /> {upcomingMeeting.place ?? "장소 협의"}</span>
                  <span><Users size={14} /> 참석 예정 {upcomingMeeting.attendees?.length ?? 0}명</span>
                </div>
              </div>
            </section>
          )}

          <section>
            <div className="section-title"><h2>최근 공유자료</h2><Link href="/knowledge">더 보기 →</Link></div>
            <div className="knowledge-mini-list">
              {recentKnowledge.map((post) => (
                <Link href={`/knowledge/${post.id}`} className="card card-hover knowledge-mini" key={post.id}>
                  <span className="knowledge-mini-icon"><BookOpen size={17} /></span>
                  <span style={{ minWidth: 0 }}><h3>{post.title}</h3><p>{post.tags.slice(0, 2).join(" · ")} · {formatDate(post.createdAt)}</p></span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="대시보드 문구 편집" description="관리자가 메인 화면의 핵심 문구를 바로 수정할 수 있습니다.">
        <form onSubmit={saveCopy}>
          <div className="form-grid">
            <Field label="상단 작은 문구" className="field-full"><input required value={draft.kicker} onChange={(event) => setDraft({ ...draft, kicker: event.target.value })} /></Field>
            <Field label="첫 번째 제목 줄" className="field-full"><input required value={draft.titleLine1} onChange={(event) => setDraft({ ...draft, titleLine1: event.target.value })} /></Field>
            <Field label="강조 제목 줄" className="field-full"><input required value={draft.titleHighlight} onChange={(event) => setDraft({ ...draft, titleHighlight: event.target.value })} /></Field>
            <Field label="소개 문구" className="field-full"><textarea required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
            <Field label="이번 달의 포커스" className="field-full"><input required value={draft.monthlyFocus} onChange={(event) => setDraft({ ...draft, monthlyFocus: event.target.value })} /></Field>
          </div>
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(false)}>취소</button><button type="submit" className="button">문구 저장</button></div>
        </form>
      </Modal>
    </>
  );
}
