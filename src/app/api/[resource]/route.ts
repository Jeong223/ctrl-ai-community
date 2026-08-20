import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin, requireContributor } from "@/lib/api/admin";
import { saveResource, type ResourceName } from "@/lib/supabase/community-repository";
import { createWriterTag } from "@/lib/writer-tag";

const resources = new Set<ResourceName>(["notices", "knowledge", "projects", "gatherings", "members"]);

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!resources.has(resource as ResourceName)) return NextResponse.json({ message: "지원하지 않는 데이터입니다." }, { status: 404 });
  const memberWritable = resource === "knowledge" || resource === "projects";
  const denied = await (memberWritable ? requireContributor(request) : requireAdmin(request));
  if (denied) return denied;
  try {
    const body = await request.json() as Record<string, unknown>;
    if (memberWritable && (typeof body.author !== "string" || !body.author.trim())) {
      return NextResponse.json({ message: "작성자를 입력해 주세요." }, { status: 400 });
    }
    if (memberWritable) {
      body.author = (body.author as string).trim();
      body.writerTag = createWriterTag(request);
    }
    return NextResponse.json({ data: await saveResource(resource as ResourceName, body) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
