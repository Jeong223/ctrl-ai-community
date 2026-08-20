"use client";

import Link from "next/link";
import { ArrowLeft, Check, CheckSquare, Edit3, ExternalLink, FileText, Link2, ListChecks, MessageCircle, MessageSquareText, Plus, Target, Trash2, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field, Modal } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import type { ProjectStatus, ProjectUpdate } from "@/lib/types";

const tone: Record<ProjectStatus, "blue" | "violet" | "green" | "orange" | "gray"> = { 아이디어: "orange", 기획: "violet", 진행중: "blue", 완료: "green", 보류: "gray" };
type DialogKind = "update" | "checklist" | "resource" | "memo" | null;

export function ProjectDetail({ id }: { id: string }) {
  const { data, saveProject, addProjectUpdate, saveProjectUpdate, removeProjectUpdate, addProjectComment, removeProjectComment } = useCommunity();
  const { isAdmin, role } = useSession();
  const canContribute = isAdmin || role === "member";
  const project = data.projects.find((item) => item.id === id);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);

  if (!project) return <div className="detail-page"><Link className="back-link" href="/projects"><ArrowLeft size={14} /> 프로젝트 목록</Link><div className="card"><EmptyState icon={<Target size={22} />} title="프로젝트를 찾을 수 없어요" description="삭제되었거나 공용 데이터에 없는 프로젝트입니다." /></div></div>;

  function openDialog(kind: Exclude<DialogKind, null>) {
    setEditingUpdate(null);
    setDialog(kind);
    setTitle(""); setAuthor(""); setUrl(""); setContent(kind === "memo" ? project!.meetingNotes : "");
  }
  function editUpdate(update: ProjectUpdate) {
    setEditingUpdate(update);
    setTitle(update.title);
    setContent(update.content);
    setAuthor(update.author);
    setDialog("update");
  }
  function deleteUpdate(update: ProjectUpdate) {
    if (window.confirm(`‘${update.title}’ 진행사항을 삭제할까요?`)) void removeProjectUpdate(project!.id, update.id);
  }
  async function submitDialog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let saved = false;
    if (dialog === "update") saved = editingUpdate
      ? await saveProjectUpdate(project!.id, { ...editingUpdate, title, content, author })
      : await addProjectUpdate(project!.id, { id: "", title, content, author, createdAt: new Date().toISOString() });
    if (dialog === "checklist") saved = await saveProject({ ...project!, checklist: [...project!.checklist, { id: crypto.randomUUID(), label: title, done: false }] });
    if (dialog === "resource") saved = await saveProject({ ...project!, resources: [...project!.resources, { label: title, url }] });
    if (dialog === "memo") saved = await saveProject({ ...project!, meetingNotes: content });
    if (saved) setDialog(null);
  }
  function toggleCheck(checkId: string) {
    void saveProject({ ...project!, checklist: project!.checklist.map((item) => item.id === checkId ? { ...item, done: !item.done } : item) });
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await addProjectComment(project!.id, { id: "", author: commentAuthor.trim(), content: commentContent.trim(), createdAt: new Date().toISOString() });
    if (saved) setCommentContent("");
  }

  function deleteComment(commentId: string) {
    if (window.confirm("이 댓글을 삭제할까요?")) void removeProjectComment(project!.id, commentId);
  }

  return (
    <>
      <Link className="back-link" href="/projects"><ArrowLeft size={14} /> 프로젝트 목록으로</Link>
      <section className="card project-detail-head">
        <div className="project-title-row">
          <div><Badge tone={tone[project.status]}>{project.status}</Badge><h1>{project.name}</h1><p>{project.description}</p><div className="project-author"><span>작성자 {project.author}</span>{project.writerTag && <span className="writer-tag">접속표시 #{project.writerTag}</span>}</div></div>
          {canContribute && <button className="button" onClick={() => openDialog("update")}><Plus size={15} /> 진행사항 추가</button>}
        </div>
      </section>
      <div className="project-detail-grid">
        <div className="dashboard-stack">
          <section className="card detail-card"><h2><Target size={17} /> 프로젝트 목표</h2><div className="goal-panel">{project.goal}</div></section>
          <section className="card detail-card">
            <div className="section-title"><h2><FileText size={17} /> 최근 업데이트</h2></div>
            {project.updates.length ? <div className="update-list">{project.updates.map((update) => <article className="update-item" key={update.id}><div className="section-title"><h3>{update.title}</h3>{isAdmin && <span className="board-actions"><button className="button button-secondary button-small" type="button" onClick={() => editUpdate(update)} aria-label={`${update.title} 수정`}><Edit3 size={12} /></button><button className="button button-danger button-small" type="button" onClick={() => deleteUpdate(update)} aria-label={`${update.title} 삭제`}><Trash2 size={12} /></button></span>}</div><p>{update.content}</p><div className="update-meta"><strong>{update.author}</strong>{update.writerTag && <span className="writer-tag">접속표시 #{update.writerTag}</span>}<time>{formatDate(update.createdAt, true)}</time></div></article>)}</div> : <EmptyState icon={<FileText size={20} />} title="아직 업데이트가 없어요" description="첫 진행사항을 남겨보세요." />}
          </section>
          <section className="card detail-card">
            <div className="section-title"><h2><MessageSquareText size={17} /> 회의 메모</h2>{canContribute && <button className="button button-secondary button-small" onClick={() => openDialog("memo")}>편집</button>}</div>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 11, whiteSpace: "pre-wrap" }}>{project.meetingNotes || "아직 회의 메모가 없습니다."}</p>
          </section>
          <section className="card detail-card comment-section">
            <div className="section-title"><h2><MessageCircle size={17} /> 프로젝트 댓글 {project.comments?.length ?? 0}</h2></div>
            {canContribute && <form className="comment-form" onSubmit={submitComment}>
              <div className="form-grid">
                <Field label="작성자"><input required value={commentAuthor} onChange={(event) => setCommentAuthor(event.target.value)} placeholder="이름 또는 별칭" /></Field>
                <Field label="댓글" className="field-full"><textarea required value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="의견, 질문, 진행상황을 자유롭게 공유해 주세요." /></Field>
              </div>
              <div className="form-actions"><button className="button" type="submit">댓글 등록</button></div>
            </form>}
            {project.comments?.length ? <div className="comment-list">{project.comments.map((comment) => <article className="comment-item" key={comment.id}>
              <div className="comment-meta"><strong>{comment.author}</strong>{comment.writerTag && <span className="writer-tag">접속표시 #{comment.writerTag}</span>}<time>{formatDate(comment.createdAt, true)}</time>{isAdmin && <button className="button button-danger button-small" type="button" onClick={() => deleteComment(comment.id)} aria-label={`${comment.author} 댓글 삭제`}><Trash2 size={12} /></button>}</div>
              <p>{comment.content}</p>
            </article>)}</div> : <EmptyState icon={<MessageCircle size={20} />} title="아직 댓글이 없어요" description="프로젝트 의견을 남겨 보세요." />}
          </section>
        </div>
        <aside className="dashboard-stack">
          <section className="next-action-panel"><small>NEXT ACTION</small><strong>{project.nextAction}</strong></section>
          <section className="card detail-card"><h2><Users size={17} /> 팀원 · {project.members.length}명</h2><div className="team-list">{project.members.map((member) => { const found = data.members.find((item) => item.name === member); return <div className="team-person" key={member}><span className="mini-avatar">{member.slice(-1)}</span><span>{member}<small>{found?.role ?? "프로젝트 멤버"}</small></span></div>; })}</div></section>
          <section className="card detail-card">
            <div className="section-title"><h2><ListChecks size={17} /> 체크리스트</h2>{canContribute && <button className="button button-secondary button-small" onClick={() => openDialog("checklist")}><Plus size={12} /></button>}</div>
            <div className="check-list">{project.checklist.map((item) => <button type="button" disabled={!canContribute} className={`check-item ${item.done ? "is-done" : ""}`} key={item.id} onClick={() => toggleCheck(item.id)}><span className="check-dot">{item.done && <Check size={11} />}</span>{item.label}</button>)}</div>
          </section>
          <section className="card detail-card">
            <div className="section-title"><h2><Link2 size={17} /> 공유자료</h2>{canContribute && <button className="button button-secondary button-small" onClick={() => openDialog("resource")}><Plus size={12} /></button>}</div>
            <div style={{ display: "grid", gap: 8 }}>{project.resources.map((resource) => <a className="resource-link" href={resource.url} target="_blank" rel="noreferrer" key={`${resource.label}-${resource.url}`}><ExternalLink size={13} /> {resource.label}</a>)}{!project.resources.length && <p style={{ color: "var(--subtle)", fontSize: 10 }}>아직 공유자료가 없습니다.</p>}</div>
            {project.resultUrl && <a className="resource-link" style={{ marginTop: 8 }} href={project.resultUrl} target="_blank" rel="noreferrer"><CheckSquare size={13} /> 결과물 열기</a>}
          </section>
        </aside>
      </div>

      <Modal open={dialog !== null} onClose={() => setDialog(null)} title={dialog === "update" ? (editingUpdate ? "진행사항 수정" : "진행사항 추가") : dialog === "checklist" ? "체크리스트 항목 추가" : dialog === "resource" ? "공유자료 추가" : "회의 메모 편집"}>
        <form onSubmit={submitDialog}>
          <div className="form-grid">
            {dialog !== "memo" && <Field label={dialog === "resource" ? "자료 이름" : dialog === "checklist" ? "할 일" : "업데이트 제목"} className="field-full"><input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field>}
            {dialog === "update" && <Field label="진행 내용" className="field-full"><textarea required value={content} onChange={(event) => setContent(event.target.value)} /></Field>}
            {dialog === "update" && <Field label="작성자" className="field-full"><input required value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="이름 또는 별칭" /></Field>}
            {dialog === "resource" && <Field label="링크" className="field-full"><input type="url" required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." /></Field>}
            {dialog === "memo" && <Field label="회의 메모" className="field-full"><textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="결정사항과 다음 논의 내용을 기록하세요." /></Field>}
          </div>
          <div className="form-actions"><button className="button button-secondary" type="button" onClick={() => setDialog(null)}>취소</button><button className="button" type="submit">저장</button></div>
        </form>
      </Modal>
    </>
  );
}
