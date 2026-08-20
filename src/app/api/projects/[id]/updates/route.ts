import { NextRequest, NextResponse } from "next/server";
import { apiError, requireContributor } from "@/lib/api/admin";
import { saveProjectUpdate } from "@/lib/supabase/community-repository";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = await requireContributor(request);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    return NextResponse.json({ data: await saveProjectUpdate(id, await request.json() as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
