import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/api/admin";
import { removeComment } from "@/lib/supabase/community-repository";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; commentId: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { id, commentId } = await context.params;
    await removeComment("projects", id, commentId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
