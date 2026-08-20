"use client";

import Link from "next/link";
import { ArrowRight, Edit3, MessageCircle, Plus, Search, Trash2, Workflow } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field, Modal, PageHeader } from "@/components/ui/primitives";
import type { ProjectRoom, ProjectStatus } from "@/lib/types";

const statuses: Array<ProjectStatus | "전체"> = ["전체", "아이디어", "기획", "진행중", "완료", "보류"];
const statusTone: Record<ProjectStatus, "blue" | "violet" | "green" | "orange" | "gray"> = { 아이디어: "orange", 기획: "violet", 진행중: "blue", 완료: "green", 보류: "gray" };
const progress: Record<ProjectStatus, number> = { 아이디어: 15, 기획: 35, 진행중: 65, 완료: 100, 보류: 25 };
const emptyProject = (): ProjectRoom => ({ id: "", name: "", description: "", author: "", members: [], status: "아이디어", goal: "", nextAction: "", updates: [], comments: [], resources: [], checklist: [], meetingNotes: "", resultUrl: "" });

export default function ProjectsPage() {
  const { data, saveProject, removeProject } = useCommunity();
  const { isAdmin, role } = useSession();
  const canContribute = isAdmin || role === "member";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("전체");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectRoom>(emptyProject);

  const projects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return data.projects.filter((project) => (status === "전체" || project.status === status) && (!normalized || `${project.name} ${project.description} ${project.members.join(" ")}`.toLocaleLowerCase("ko").includes(normalized)));
  }, [data.projects, query, status]);

  function openNew() { setDraft(emptyProject()); setFormOpen(true); }
  function openEdit(project: ProjectRoom) { setDraft(project); setFormOpen(true); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await saveProject({ ...draft, members: draft.members.filter(Boolean) })) setFormOpen(false);
  }
  function remove(project: ProjectRoom) {
    if (window.confirm(`‘${project.name}’ 프로젝트 방을 삭제할까요?`)) void removeProject(project.id);
  }

  return (
    <>
      <PageHeader eyebrow="Project studio" title="프로젝트 방" description="팀의 목표와 진행상황, 다음 할 일을 선명하게 공유하고 작은 결과물을 완성하세요." action={canContribute ? <button className="button" onClick={openNew}><Plus size={16} /> 프로젝트 방 만들기</button> : undefined} />
      <div className="toolbar">
        <label className="search-box"><span className="sr-only">프로젝트 검색</span><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트명, 설명, 팀원 검색" /></label>
        <div className="filter-pills">{statuses.map((item) => <button key={item} className={`filter-pill ${status === item ? "is-active" : ""}`} onClick={() => setStatus(item)}>{item}</button>)}</div>
      </div>
      <p className="result-count">{projects.length}개의 프로젝트 방</p>
      {projects.length ? <section className="projects-grid">
        {projects.map((project) => (
          <article className="card card-hover project-card" key={project.id}>
            <div className="project-card-accent" />
            <div className="project-card-body">
              <div className="project-card-top"><span className="project-symbol"><Workflow size={19} /></span><Badge tone={statusTone[project.status]}>{project.status}</Badge></div>
              <Link href={`/projects/${project.id}`}><h2>{project.name}</h2></Link>
              <p>{project.description}</p>
              <div className="project-author"><span>작성자 {project.author}</span>{project.writerTag && <span className="writer-tag">접속표시 #{project.writerTag}</span>}<span className="comment-count"><MessageCircle size={12} /> {project.comments?.length ?? 0}</span></div>
              <div className="project-next"><small>NEXT ACTION</small><strong>{project.nextAction}</strong></div>
              <div className="project-card-footer">
                <div className="avatar-stack" aria-label={`팀원 ${project.members.join(", ")}`}>{project.members.map((member) => <span className="mini-avatar" key={member}>{member.slice(-1)}</span>)}</div>
                <div className="project-actions">
                  {canContribute && <button className="button button-secondary button-small" onClick={() => openEdit(project)} aria-label={`${project.name} 수정`}><Edit3 size={12} /></button>}
                  {isAdmin && <button className="button button-danger button-small" onClick={() => remove(project)} aria-label={`${project.name} 삭제`}><Trash2 size={12} /></button>}
                  <Link className="button button-secondary button-small" href={`/projects/${project.id}`} aria-label={`${project.name} 열기`}><ArrowRight size={13} /></Link>
                </div>
              </div>
              <div className="progress-track" style={{ marginTop: 17 }} aria-label={`진행도 ${progress[project.status]}%`}><i style={{ width: `${progress[project.status]}%` }} /></div>
            </div>
          </article>
        ))}
      </section> : <div className="card"><EmptyState icon={<Workflow size={22} />} title="조건에 맞는 프로젝트가 없어요" description="필터를 바꾸거나 새 프로젝트 방을 만들어 보세요." /></div>}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={draft.id ? "프로젝트 수정" : "새 프로젝트 방"} description="누가, 무엇을, 다음 모임까지 어디까지 할지 정해보세요.">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="프로젝트명" className="field-full"><input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="프로젝트 이름" /></Field>
            <Field label="작성자" hint="프로젝트에 표시할 이름을 입력해 주세요."><input required value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} placeholder="이름 또는 별칭" /></Field>
            <Field label="진행 상태"><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ProjectStatus })}>{statuses.filter((item) => item !== "전체").map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="팀원" hint="쉼표로 구분해 주세요."><input required value={draft.members.join(", ")} onChange={(event) => setDraft({ ...draft, members: event.target.value.split(",").map((name) => name.trim()) })} placeholder="이름1, 이름2, 이름3" /></Field>
            <Field label="프로젝트 설명" className="field-full"><textarea required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="어떤 문제를 해결하나요?" /></Field>
            <Field label="목표" className="field-full"><input required value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} placeholder="완료했을 때의 모습을 한 문장으로" /></Field>
            <Field label="다음 모임까지 할 일" className="field-full"><input required value={draft.nextAction} onChange={(event) => setDraft({ ...draft, nextAction: event.target.value })} placeholder="가장 가까운 다음 행동" /></Field>
            <Field label="결과물 링크" className="field-full"><input type="url" value={draft.resultUrl ?? ""} onChange={(event) => setDraft({ ...draft, resultUrl: event.target.value })} placeholder="https://... (선택)" /></Field>
          </div>
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>취소</button><button className="button" type="submit">{draft.id ? "변경사항 저장" : "프로젝트 생성"}</button></div>
        </form>
      </Modal>
    </>
  );
}
