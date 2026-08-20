"use client";

import { Edit3, Plus, Search, Sparkles, Trash2, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field, Modal, PageHeader } from "@/components/ui/primitives";
import type { Member } from "@/lib/types";

const memberColors = ["blue", "violet", "cyan", "pink", "orange", "emerald", "indigo", "sky", "teal", "amber"];

const emptyMember = (): Member => ({
  id: "",
  name: "",
  role: "",
  interest: "",
  aiTools: [],
  projects: [],
  bio: "",
  initials: "",
  color: "blue",
});

export default function MembersPage() {
  const { data, saveMember, removeMember } = useCommunity();
  const { isAdmin } = useSession();
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("전체");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Member>(emptyMember);

  const roles = ["전체", ...Array.from(new Set(data.members.map((member) => member.role).filter(Boolean) as string[]))];
  const members = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return data.members.filter((member) =>
      (selectedRole === "전체" || member.role === selectedRole)
      && (!normalized || `${member.name} ${member.role} ${member.interest} ${member.aiTools?.join(" ")}`.toLocaleLowerCase("ko").includes(normalized)),
    );
  }, [data.members, query, selectedRole]);
  const fields = new Set(data.members.map((member) => member.role).filter(Boolean)).size;
  const tools = new Set(data.members.flatMap((member) => member.aiTools ?? [])).size;

  function openNew() {
    setDraft(emptyMember());
    setFormOpen(true);
  }

  function openEdit(member: Member) {
    setDraft(member);
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await saveMember({
      ...draft,
      initials: draft.initials.trim().toUpperCase(),
      aiTools: draft.aiTools?.filter(Boolean),
      projects: draft.projects?.filter(Boolean),
    });
    if (saved) setFormOpen(false);
  }

  function remove(member: Member) {
    if (window.confirm(`‘${member.name}’ 회원정보를 삭제할까요?`)) {
      void removeMember(member.id);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Our people"
        title="함께하는 회원"
        description="서로 다른 경험과 관점을 가진 동료들이 AI라는 공통 관심사로 연결됩니다."
        action={isAdmin ? <button className="button" onClick={openNew}><Plus size={16} /> 회원 추가</button> : undefined}
      />
      {isAdmin && <div className="admin-guide"><span><Edit3 size={16} /></span><div><strong>회원정보 관리자 편집</strong><p>카드의 수정 버튼으로 직무, 관심분야, AI 도구와 참여 프로젝트를 바로 관리할 수 있습니다.</p></div></div>}
      <section className="members-summary" aria-label="회원 구성 요약">
        <div className="card summary-card"><small>전체 회원</small><strong>{data.members.length}명</strong></div>
        <div className="card summary-card"><small>전문 분야</small><strong>{fields}개</strong></div>
        <div className="card summary-card"><small>활용 AI 도구</small><strong>{tools}개</strong></div>
      </section>
      <div className="toolbar">
        <label className="search-box"><span className="sr-only">회원 검색</span><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, 분야, 관심사, AI 도구 검색" /></label>
        <div className="filter-pills">{roles.map((item) => <button key={item} className={`filter-pill ${selectedRole === item ? "is-active" : ""}`} onClick={() => setSelectedRole(item)}>{item}</button>)}</div>
      </div>
      {members.length ? <section className="members-grid" aria-label="회원 목록">{members.map((member) => (
        <article className="card card-hover member-card" key={member.id}>
          <div className="member-top">
            <span className={`member-avatar avatar-${member.color}`}>{member.initials}</span>
            <div className="member-card-controls">
              <Badge tone="blue">{member.role}</Badge>
              {isAdmin && <div className="member-admin-actions"><button className="button button-secondary button-small" onClick={() => openEdit(member)} aria-label={`${member.name} 회원정보 수정`}><Edit3 size={12} /></button><button className="button button-danger button-small" onClick={() => remove(member)} aria-label={`${member.name} 회원정보 삭제`}><Trash2 size={12} /></button></div>}
            </div>
          </div>
          <h2>{member.name}</h2><span className="member-role">{member.interest}</span><p className="member-bio">“{member.bio}”</p>
          <dl className="member-detail"><div><dt>AI 도구</dt><dd>{member.aiTools?.join(" · ") || "-"}</dd></div><div><dt>프로젝트</dt><dd>{member.projects?.join(", ") || "준비 중"}</dd></div></dl>
        </article>
      ))}</section> : <div className="card"><EmptyState icon={<Users size={22} />} title="조건에 맞는 회원이 없어요" description="검색어나 분야 필터를 바꿔보세요." /></div>}
      <div className="long-term"><span><Sparkles size={23} /></span><div><h2>우리의 다양성이 프로젝트의 가능성을 넓힙니다.</h2><p>Software, Hardware, Design, CAD, Quality, Certification, Marketing의 경험을 자유롭게 연결해 보세요.</p></div></div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={draft.id ? "회원정보 수정" : "새 회원 추가"} description="공개 가능한 동호회 활동 정보만 입력해 주세요.">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="이름"><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
            <Field label="프로필 이니셜" hint="카드 프로필에 표시됩니다."><input required maxLength={3} value={draft.initials} onChange={(event) => setDraft({ ...draft, initials: event.target.value })} placeholder="예: MJ" /></Field>
            <Field label="소속·직무"><input required value={draft.role ?? ""} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Software, Design 등" /></Field>
            <Field label="프로필 색상"><select value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })}>{memberColors.map((color) => <option value={color} key={color}>{color}</option>)}</select></Field>
            <Field label="관심 AI 분야" className="field-full"><input required value={draft.interest ?? ""} onChange={(event) => setDraft({ ...draft, interest: event.target.value })} placeholder="AI 자동화, 생성형 디자인 등" /></Field>
            <Field label="사용 중인 AI 도구" hint="쉼표로 구분해 주세요." className="field-full"><input value={draft.aiTools?.join(", ") ?? ""} onChange={(event) => setDraft({ ...draft, aiTools: event.target.value.split(",").map((item) => item.trim()) })} placeholder="ChatGPT, Codex" /></Field>
            <Field label="참여 프로젝트" hint="쉼표로 구분해 주세요." className="field-full"><input value={draft.projects?.join(", ") ?? ""} onChange={(event) => setDraft({ ...draft, projects: event.target.value.split(",").map((item) => item.trim()) })} /></Field>
            <Field label="한 줄 소개" className="field-full"><textarea required value={draft.bio ?? ""} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></Field>
          </div>
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>취소</button><button type="submit" className="button">{draft.id ? "회원정보 저장" : "회원 추가"}</button></div>
        </form>
      </Modal>
    </>
  );
}
