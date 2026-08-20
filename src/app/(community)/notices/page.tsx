"use client";

import Link from "next/link";
import { Edit3, FileText, Pin, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field, Modal, PageHeader } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import type { Notice, NoticeCategory } from "@/lib/types";

const categories: Array<NoticeCategory | "전체"> = ["전체", "정기모임", "지원비", "프로젝트", "교육", "행사", "회칙", "기타"];

const emptyNotice = (): Notice => ({
  id: "",
  title: "",
  content: "",
  category: "기타",
  pinned: false,
  createdAt: new Date().toISOString(),
  author: "Ctrl + AI 회원",
});

export default function NoticesPage() {
  const { data, saveNotice, removeNotice } = useCommunity();
  const { isAdmin } = useSession();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("전체");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Notice>(emptyNotice);

  const notices = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return [...data.notices]
      .filter((notice) => category === "전체" || notice.category === category)
      .filter((notice) => !normalized || `${notice.title} ${notice.content} ${notice.author}`.toLocaleLowerCase("ko").includes(normalized))
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [category, data.notices, query]);

  function openNew() {
    setDraft(emptyNotice());
    setFormOpen(true);
  }

  function openEdit(notice: Notice) {
    setDraft(notice);
    setFormOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await saveNotice(draft)) setFormOpen(false);
  }

  function remove(notice: Notice) {
    if (window.confirm(`‘${notice.title}’ 공지를 삭제할까요? 모든 회원 화면에서 삭제됩니다.`)) {
      void removeNotice(notice.id);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Notice board"
        title="공지사항"
        description="정기모임, 지원 제도, 프로젝트 운영에 필요한 소식을 한곳에서 확인하세요."
        action={isAdmin ? <button className="button" onClick={openNew}><Plus size={16} /> 새 공지 작성</button> : undefined}
      />

      <div className="toolbar">
        <label className="search-box">
          <span className="sr-only">공지 검색</span><Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목, 내용, 작성자 검색" />
        </label>
        <div className="filter-pills" aria-label="카테고리 필터">
          {categories.map((item) => <button key={item} className={`filter-pill ${category === item ? "is-active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>

      <p className="result-count">총 {notices.length}개의 공지</p>
      <section className="card board-list" aria-label="공지 목록">
        {notices.length ? notices.map((notice) => (
          <article className="board-item" key={notice.id}>
            <div>
              <div className="board-title-line">
                {notice.pinned && <Pin className="pin-icon" size={14} aria-label="고정 공지" />}
                <Link href={`/notices/${notice.id}`}><h2>{notice.title}</h2></Link>
                <Badge tone={notice.pinned ? "blue" : "gray"}>{notice.category}</Badge>
              </div>
              <p>{notice.content}</p>
              <div className="item-meta"><span>{notice.author}</span><i /><time>{formatDate(notice.createdAt)}</time>{notice.pinned && <><i /><span>중요 공지</span></>}</div>
            </div>
            {isAdmin && <div className="board-actions">
              <button className="button button-secondary button-small" onClick={() => openEdit(notice)}><Edit3 size={13} /> 수정</button>
              <button className="button button-danger button-small" onClick={() => remove(notice)} aria-label={`${notice.title} 삭제`}><Trash2 size={13} /></button>
            </div>}
          </article>
        )) : <EmptyState icon={<FileText size={22} />} title="조건에 맞는 공지가 없어요" description="검색어 또는 카테고리를 바꿔보세요." />}
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={draft.id ? "공지 수정" : "새 공지 작성"} description="운영에 필요한 핵심 내용을 간결하게 알려주세요.">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="제목" className="field-full"><input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="공지 제목" /></Field>
            <Field label="카테고리"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as NoticeCategory })}>{categories.filter((item) => item !== "전체").map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="작성자"><input required value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} /></Field>
            <Field label="내용" className="field-full"><textarea required value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="회원들이 알아야 할 내용을 입력하세요." /></Field>
            <label className="checkbox-field field-full"><input type="checkbox" checked={Boolean(draft.pinned)} onChange={(event) => setDraft({ ...draft, pinned: event.target.checked })} /> 중요 공지로 상단에 고정</label>
          </div>
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>취소</button><button className="button" type="submit">{draft.id ? "변경사항 저장" : "공지 등록"}</button></div>
        </form>
      </Modal>
    </>
  );
}
