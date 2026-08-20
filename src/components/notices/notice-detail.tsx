"use client";

import Link from "next/link";
import { ArrowLeft, Pin } from "lucide-react";
import { useCommunity } from "@/components/providers/community-provider";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";

export function NoticeDetail({ id }: { id: string }) {
  const { data } = useCommunity();
  const notice = data.notices.find((item) => item.id === id);

  if (!notice) {
    return <div className="detail-page"><Link className="back-link" href="/notices"><ArrowLeft size={14} /> 공지 목록</Link><div className="card"><EmptyState icon={<Pin size={22} />} title="공지를 찾을 수 없어요" description="삭제되었거나 이 브라우저에 저장되지 않은 공지입니다." /></div></div>;
  }

  return (
    <div className="detail-page">
      <Link className="back-link" href="/notices"><ArrowLeft size={14} /> 공지 목록으로</Link>
      <article className="card article-card">
        <div className="tag-row"><Badge tone={notice.pinned ? "blue" : "gray"}>{notice.category}</Badge>{notice.pinned && <Badge tone="orange"><Pin size={10} /> 중요 공지</Badge>}</div>
        <h1>{notice.title}</h1>
        <div className="article-meta"><span>작성자 {notice.author}</span><span>·</span><time>{formatDate(notice.createdAt, true)}</time></div>
        <div className="article-content">{notice.content}</div>
      </article>
    </div>
  );
}
