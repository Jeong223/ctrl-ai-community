"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { useCommunity } from "@/components/providers/community-provider";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";

export function KnowledgeDetail({ id }: { id: string }) {
  const { data } = useCommunity();
  const post = data.knowledge.find((item) => item.id === id);
  if (!post) return <div className="detail-page"><Link className="back-link" href="/knowledge"><ArrowLeft size={14} /> 정보공유 목록</Link><div className="card"><EmptyState icon={<BookOpen size={22} />} title="정보글을 찾을 수 없어요" description="삭제되었거나 이 브라우저에 저장되지 않은 글입니다." /></div></div>;
  return (
    <div className="detail-page">
      <Link className="back-link" href="/knowledge"><ArrowLeft size={14} /> 정보공유 목록으로</Link>
      <article className="card article-card">
        <div className="tag-row">{post.tags.map((tag) => <Badge key={tag} tone="violet">#{tag}</Badge>)}</div>
        <h1>{post.title}</h1>
        <div className="article-meta"><span>작성자 {post.author}</span><span>·</span><time>{formatDate(post.createdAt, true)}</time></div>
        <div className="article-content">{post.content}</div>
        {post.links?.length ? <div className="article-links">{post.links.map((url) => <a href={url} key={url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> {url}</a>)}</div> : null}
      </article>
    </div>
  );
}
