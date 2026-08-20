import { NoticeDetail } from "@/components/notices/notice-detail";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeDetail id={id} />;
}
