import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/api/admin";
import { removeProjectUpdate, saveProjectUpdate } from "@/lib/supabase/community-repository";

type UpdateContext = { params: Promise<{ id: string; updateId: string }> };

export async function PUT(request: NextRequest, context: UpdateContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id, updateId } = await context.params;
    return NextResponse.json({ data: await saveProjectUpdate(id, await request.json() as Record<string, unknown>, updateId) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, context: UpdateContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id, updateId } = await context.params;
    await removeProjectUpdate(id, updateId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
