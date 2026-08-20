import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin, requireContributor } from "@/lib/api/admin";
import { saveResource, type ResourceName } from "@/lib/supabase/community-repository";

const resources = new Set<ResourceName>(["notices", "knowledge", "projects", "gatherings", "members"]);

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!resources.has(resource as ResourceName)) return NextResponse.json({ message: "지원하지 않는 데이터입니다." }, { status: 404 });
  const memberWritable = resource === "knowledge" || resource === "projects";
  const denied = await (memberWritable ? requireContributor(request) : requireAdmin(request));
  if (denied) return denied;
  try {
    const body = await request.json() as Record<string, unknown>;
    return NextResponse.json({ data: await saveResource(resource as ResourceName, body) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
