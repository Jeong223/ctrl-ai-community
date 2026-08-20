import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/api/admin";
import { removeResource, saveResource, type ResourceName } from "@/lib/supabase/community-repository";

const resources = new Set<ResourceName>(["notices", "knowledge", "projects", "gatherings", "members"]);

type ResourceContext = { params: Promise<{ resource: string; id: string }> };

async function getParams(context: ResourceContext) {
  const { resource, id } = await context.params;
  if (!resources.has(resource as ResourceName)) throw new Error("지원하지 않는 데이터입니다.");
  return { resource: resource as ResourceName, id };
}

export async function PUT(request: NextRequest, context: ResourceContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { resource, id } = await getParams(context);
    return NextResponse.json({ data: await saveResource(resource, await request.json() as Record<string, unknown>, id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, context: ResourceContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { resource, id } = await getParams(context);
    await removeResource(resource, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
