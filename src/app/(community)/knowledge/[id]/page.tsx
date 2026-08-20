import { KnowledgeDetail } from "@/components/knowledge/knowledge-detail";

export default async function KnowledgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KnowledgeDetail id={id} />;
}
