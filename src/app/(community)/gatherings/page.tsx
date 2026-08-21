"use client";

import { CalendarDays, Clock3, Edit3, ExternalLink, MapPin, Plus, Trash2, UserCheck, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field, Modal, PageHeader } from "@/components/ui/primitives";
import type { Gathering } from "@/lib/types";

const emptyGathering = (): Gathering => ({ id: "", title: "", date: new Date().toISOString().slice(0, 10), time: "18:30", place: "", memo: "", attendees: [], mapUrl: "" });

export default function GatheringsPage() {
  const { data, saveGathering, removeGathering } = useCommunity();
  const { isAdmin } = useSession();
  const [filter, setFilter] = useState<"예정" | "지난 모임" | "전체">("예정");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Gathering>(emptyGathering);

  const gatherings = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return [...data.gatherings].filter((item) => filter === "전체" || (filter === "예정" ? new Date(`${item.date}T23:59:59`) >= today : new Date(`${item.date}T23:59:59`) < today)).sort((a, b) => filter === "지난 모임" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [data.gatherings, filter]);

  const focus = [...data.gatherings].sort((a, b) => a.date.localeCompare(b.date)).find((item) => new Date(`${item.date}T23:59:59`) >= new Date()) ?? data.gatherings[0];
  const focusDate = focus ? new Date(`${focus.date}T12:00:00`) : new Date();
  const calendarYear = focusDate.getFullYear();
  const calendarMonth = focusDate.getMonth();
  const days = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const eventDays = new Set(data.gatherings.filter((item) => { const date = new Date(`${item.date}T12:00:00`); return date.getFullYear() === calendarYear && date.getMonth() === calendarMonth; }).map((item) => Number(item.date.slice(-2))));

  function openNew() { setDraft(emptyGathering()); setFormOpen(true); }
  function openEdit(gathering: Gathering) { setDraft(gathering); setFormOpen(true); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (await saveGathering(draft)) setFormOpen(false); }
  function remove(gathering: Gathering) { if (window.confirm(`‘${gathering.title}’ 모임 기록을 삭제할까요?`)) void removeGathering(gathering.id); }
  function toggleRsvp(gathering: Gathering) {
    const attendees = gathering.attendees ?? [];
    void saveGathering({ ...gathering, attendees: attendees.includes("나") ? attendees.filter((name) => name !== "나") : [...attendees, "나"] });
  }

  return (
    <>
      <PageHeader eyebrow="Gatherings" title="모임 일정" description="정기모임과 가벼운 점심, AI 행사 참여 일정을 함께 정하고 기록합니다." action={isAdmin ? <button className="button" onClick={openNew}><Plus size={16} /> 새 일정 추가</button> : undefined} />
      <div className="toolbar"><div className="filter-pills">{(["예정", "지난 모임", "전체"] as const).map((item) => <button key={item} className={`filter-pill ${filter === item ? "is-active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="gatherings-layout">
        <section className="gathering-list" aria-label="모임 목록">
          {gatherings.length ? gatherings.map((gathering) => {
            const date = new Date(`${gathering.date}T12:00:00`);
            const joined = gathering.attendees?.includes("나");
            const past = date < new Date(new Date().toDateString());
            return <article className="card card-hover gathering-card" key={gathering.id}>
              <div className="gathering-calendar"><span>{date.toLocaleDateString("ko-KR", { month: "short" })}</span><strong>{date.getDate()}</strong><small>{date.toLocaleDateString("ko-KR", { weekday: "long" })}</small></div>
              <div className="gathering-content"><div className="tag-row" style={{ margin: 0 }}><Badge tone={past ? "gray" : "blue"}>{past ? "지난 모임" : "예정"}</Badge></div><h2>{gathering.title}</h2><div className="gathering-facts"><span><Clock3 size={13} /> {gathering.time || "시간 협의"}</span><span><MapPin size={13} /> {gathering.place || "장소 협의"}</span><span><Users size={13} /> {gathering.attendees?.length ?? 0}명</span></div>{gathering.memo && <p>{gathering.memo}</p>}{gathering.mapUrl && <a href={gathering.mapUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontSize: 9, fontWeight: 700 }}>지도 열기 <ExternalLink size={10} style={{ display: "inline" }} /></a>}</div>
              {isAdmin && <div className="gathering-actions">{!past && <button className={`button button-small ${joined ? "button-secondary" : ""}`} onClick={() => toggleRsvp(gathering)}><UserCheck size={12} /> {joined ? "참석 취소" : "참석"}</button>}<button className="button button-secondary button-small" onClick={() => openEdit(gathering)} aria-label={`${gathering.title} 수정`}><Edit3 size={12} /></button><button className="button button-danger button-small" onClick={() => remove(gathering)} aria-label={`${gathering.title} 삭제`}><Trash2 size={12} /></button></div>}
            </article>;
          }) : <div className="card"><EmptyState icon={<CalendarDays size={22} />} title="표시할 모임이 없어요" description="다른 기간을 보거나 새 일정을 추가해 보세요." /></div>}
        </section>
        <aside className="card calendar-side">
          <h2>{calendarYear}년 {calendarMonth + 1}월</h2> 
          <div className="calendar-month" aria-label={`${calendarYear}년 ${calendarMonth + 1}월 달력`}>
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => <span className="day-name" key={day}>{day}</span>)}
            {Array.from({ length: firstDay }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: days }, (_, index) => index + 1).map((day) => <span className={eventDays.has(day) ? "has-event" : ""} key={day}>{day}</span>)}
          </div>
          <div className="calendar-legend"><i /> Ctrl + AI 일정</div>
        </aside>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={draft.id ? "모임 일정 수정" : "새 모임 일정"} description="일시와 장소가 미정이라면 비워두어도 괜찮아요.">
        <form onSubmit={submit}><div className="form-grid">
          <Field label="모임 제목" className="field-full"><input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="예: 9월 프로젝트 중간 공유" /></Field>
          <Field label="날짜"><input required type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></Field>
          <Field label="시간"><input type="time" value={draft.time ?? ""} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></Field>
          <Field label="장소" className="field-full"><input value={draft.place ?? ""} onChange={(event) => setDraft({ ...draft, place: event.target.value })} placeholder="장소 또는 회의실" /></Field>
          <Field label="지도 링크" className="field-full"><input type="url" value={draft.mapUrl ?? ""} onChange={(event) => setDraft({ ...draft, mapUrl: event.target.value })} placeholder="https://... (선택)" /></Field>
          <Field label="메모" className="field-full"><textarea value={draft.memo ?? ""} onChange={(event) => setDraft({ ...draft, memo: event.target.value })} placeholder="준비할 것, 모임 목적 등을 적어주세요." /></Field>
        </div><div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>취소</button><button type="submit" className="button">{draft.id ? "변경사항 저장" : "일정 등록"}</button></div></form>
      </Modal>
    </>
  );
}
