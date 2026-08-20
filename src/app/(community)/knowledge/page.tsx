"use client";

import Link from "next/link";
import { BookOpen, Edit3, ExternalLink, MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field, Modal, PageHeader } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import type { KnowledgePost } from "@/lib/types";

const emptyPost = (): KnowledgePost => ({
  id: "",
  title: "",
  content: "",
  tags: [],
  links: [],
  createdAt: new Date().toISOString(),
  author: "",
  comments: [],
});

export default function KnowledgePage() {
  const { data, saveKnowledge, removeKnowledge } = useCommunity();
  const { isAdmin, role } = useSession();
  const canContribute = isAdmin || role === "member";
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("전체");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<KnowledgePost>(emptyPost);

  const tags = useMemo(() => ["전체", ...Array.from(new Set(data.knowledge.flatMap((post) => post.tags))).sort()], [data.knowledge]);
  const posts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return [...data.knowledge]
      .filter((post) => activeTag === "전체" || post.tags.includes(activeTag))
      .filter((post) => !normalized || `${post.title} ${post.content} ${post.tags.join(" ")}`.toLocaleLowerCase("ko").includes(normalized))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTag, data.knowledge, query]);

  function openNew() { setDraft(emptyPost()); setFormOpen(true); }
  function openEdit(post: KnowledgePost) { setDraft(post); setFormOpen(true); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await saveKnowledge({ ...draft, tags: draft.tags.filter(Boolean), links: draft.links?.filter(Boolean) })) setFormOpen(false);
  }
  function remove(post: KnowledgePost) {
    if (window.confirm(`‘${post.title}’ 정보글을 삭제할까요?`)) void removeKnowledge(post.id);
  }

  return (
    <>
      <PageHeader eyebrow="Knowledge hub" title="정보공유" description="AI 도구 활용법, 프롬프트, 행사와 학습 자료를 모아 함께 성장합니다." action={canContribute ? <button className="button" onClick={openNew}><Plus size={16} /> 정보 공유하기</button> : undefined} />
      <div className="toolbar">
        <label className="search-box"><span className="sr-only">정보글 검색</span><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목, 내용, 태그 검색" /></label>
        <div className="filter-pills" aria-label="태그 필터">{tags.slice(0, 8).map((tag) => <button key={tag} className={`filter-pill ${activeTag === tag ? "is-active" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>)}</div>
      </div>
      <p className="result-count">최신순 · {posts.length}개의 공유자료</p>
      {posts.length ? (
        <section className="knowledge-grid" aria-label="정보공유 글 목록">
          {posts.map((post) => (
            <article className="card card-hover knowledge-card" key={post.id}>
              <div className="knowledge-card-top"><span className="knowledge-card-icon"><BookOpen size={18} /></span>{post.links?.length ? <ExternalLink size={14} color="var(--subtle)" /> : null}</div>
              <Link href={`/knowledge/${post.id}`}><h2>{post.title}</h2></Link>
              <p>{post.content}</p>
              <div className="tag-row">{post.tags.map((tag) => <Badge key={tag} tone="violet">#{tag}</Badge>)}</div>
              <footer className="knowledge-card-footer"><span>{post.author}</span>{post.writerTag && <span className="writer-tag">접속표시 #{post.writerTag}</span>}<span>·</span><time>{formatDate(post.createdAt)}</time><span className="comment-count"><MessageCircle size={12} /> {post.comments?.length ?? 0}</span>{isAdmin && <span className="board-actions"><button className="button button-secondary button-small" onClick={() => openEdit(post)} aria-label={`${post.title} 수정`}><Edit3 size={12} /></button><button className="button button-danger button-small" onClick={() => remove(post)} aria-label={`${post.title} 삭제`}><Trash2 size={12} /></button></span>}</footer>
            </article>
          ))}
        </section>
      ) : <div className="card"><EmptyState icon={<BookOpen size={22} />} title="찾는 자료가 없어요" description="다른 검색어나 태그를 선택해 보세요." /></div>}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={draft.id ? "정보글 수정" : "새 정보 공유"} description="핵심 요약과 원문 링크를 함께 남기면 더 유용해요.">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Field label="제목" className="field-full"><input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="무엇을 공유하나요?" /></Field>
            <Field label="작성자" hint="게시판에 표시할 이름을 직접 입력해 주세요."><input required value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} placeholder="이름 또는 별칭" /></Field>
            <Field label="태그" hint="쉼표로 구분해 주세요."><input required value={draft.tags.join(", ")} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(",").map((tag) => tag.trim()) })} placeholder="Codex, 자동화" /></Field>
            <Field label="내용" className="field-full"><textarea required value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="추천 이유, 사용 경험, 핵심 내용을 정리해 주세요." /></Field>
            <Field label="참고 링크" hint="여러 개라면 쉼표로 구분해 주세요." className="field-full"><input type="text" value={draft.links?.join(", ") ?? ""} onChange={(event) => setDraft({ ...draft, links: event.target.value.split(",").map((link) => link.trim()) })} placeholder="https://..." /></Field>
          </div>
          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)}>취소</button><button type="submit" className="button">{draft.id ? "변경사항 저장" : "정보글 등록"}</button></div>
        </form>
      </Modal>
    </>
  );
}
