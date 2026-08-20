import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin, requireContributor } from "@/lib/api/admin";
import { removeResource, saveResource, type ResourceName } from "@/lib/supabase/community-repository";

const resources = new Set<ResourceName>(["notices", "knowledge", "projects", "gatherings", "members"]);

type ResourceContext = { params: Promise<{ resource: string; id: string }> };

async function getParams(context: ResourceContext) {
  const { resource, id } = await context.params;
  if (!resources.has(resource as ResourceName)) throw new Error("지원하지 않는 데이터입니다.");
  return { resource: resource as ResourceName, id };
}

export async function PUT(request: NextRequest, context: ResourceContext) {
  try {
    const { resource, id } = await getParams(context);
    const denied = resource === "projects"
      ? await requireContributor(request)
      : await requireAdmin(request);
    if (denied) return denied;
    const body = await request.json() as Record<string, unknown>;
    if (resource === "projects" && (typeof body.author !== "string" || !body.author.trim())) {
      return NextResponse.json({ message: "작성자를 입력해 주세요." }, { status: 400 });
    }
    if (resource === "projects") body.author = (body.author as string).trim();
    const data = await saveResource(resource, body, id);
    return NextResponse.json({ data });
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
