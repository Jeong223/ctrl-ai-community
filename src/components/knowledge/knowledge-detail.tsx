"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, MessageCircle, Trash2 } from "lucide-react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Badge, EmptyState, Field } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";

export function KnowledgeDetail({ id }: { id: string }) {
  const { data, addKnowledgeComment, removeKnowledgeComment } = useCommunity();
  const { isAdmin, role } = useSession();
  const canContribute = isAdmin || role === "member";
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const post = data.knowledge.find((item) => item.id === id);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post) return;
    const saved = await addKnowledgeComment(post.id, { id: "", author: author.trim(), content: content.trim(), createdAt: new Date().toISOString() });
    if (saved) setContent("");
  }

  function deleteComment(commentId: string) {
    if (post && window.confirm("이 댓글을 삭제할까요?")) void removeKnowledgeComment(post.id, commentId);
  }

  if (!post) return <div className="detail-page"><Link className="back-link" href="/knowledge"><ArrowLeft size={14} /> 정보공유 목록</Link><div className="card"><EmptyState icon={<BookOpen size={22} />} title="정보글을 찾을 수 없어요" description="삭제되었거나 공용 데이터에 저장되지 않은 글입니다." /></div></div>;
  return (
    <div className="detail-page">
      <Link className="back-link" href="/knowledge"><ArrowLeft size={14} /> 정보공유 목록으로</Link>
      <article className="card article-card">
        <div className="tag-row">{post.tags.map((tag) => <Badge key={tag} tone="violet">#{tag}</Badge>)}</div>
        <h1>{post.title}</h1>
        <div className="article-meta"><span>작성자 {post.author}</span>{post.writerTag && <span className="writer-tag">접속표시 #{post.writerTag}</span>}<span>·</span><time>{formatDate(post.createdAt, true)}</time></div>
        <div className="article-content">{post.content}</div>
        {post.links?.length ? <div className="article-links">{post.links.map((url) => <a href={url} key={url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> {url}</a>)}</div> : null}
      </article>
      <section className="card comment-section">
        <div className="section-title"><h2><MessageCircle size={17} /> 댓글 {post.comments?.length ?? 0}</h2></div>
        {canContribute && <form className="comment-form" onSubmit={submitComment}>
          <div className="form-grid">
            <Field label="작성자"><input required value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="이름 또는 별칭" /></Field>
            <Field label="댓글" className="field-full"><textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="의견이나 추가 정보를 남겨 주세요." /></Field>
          </div>
          <div className="form-actions"><button className="button" type="submit">댓글 등록</button></div>
        </form>}
        {post.comments?.length ? <div className="comment-list">{post.comments.map((comment) => <article className="comment-item" key={comment.id}>
          <div className="comment-meta"><strong>{comment.author}</strong>{comment.writerTag && <span className="writer-tag">접속표시 #{comment.writerTag}</span>}<time>{formatDate(comment.createdAt, true)}</time>{isAdmin && <button className="button button-danger button-small" type="button" onClick={() => deleteComment(comment.id)} aria-label={`${comment.author} 댓글 삭제`}><Trash2 size={12} /></button>}</div>
          <p>{comment.content}</p>
        </article>)}</div> : <EmptyState icon={<MessageCircle size={20} />} title="아직 댓글이 없어요" description="첫 의견을 남겨 보세요." />}
      </section>
    </div>
  );
}
