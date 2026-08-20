import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/api/admin";
import { removeProjectUpdate, saveProjectUpdate } from "@/lib/supabase/community-repository";

type UpdateContext = { params: Promise<{ id: string; updateId: string }> };

export async function PUT(request: NextRequest, context: UpdateContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id, updateId } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.author !== "string" || !body.author.trim()) {
      return NextResponse.json({ message: "작성자를 입력해 주세요." }, { status: 400 });
    }
    body.author = body.author.trim();
    return NextResponse.json({ data: await saveProjectUpdate(id, body, updateId) });
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
