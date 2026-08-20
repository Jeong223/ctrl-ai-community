import { NextRequest, NextResponse } from "next/server";
import { apiError, requireContributor } from "@/lib/api/admin";
import { saveComment } from "@/lib/supabase/community-repository";
import { createWriterTag } from "@/lib/writer-tag";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = await requireContributor(request);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.author !== "string" || !body.author.trim() || typeof body.content !== "string" || !body.content.trim()) {
      return NextResponse.json({ message: "작성자와 댓글 내용을 입력해 주세요." }, { status: 400 });
    }
    body.author = body.author.trim();
    body.content = body.content.trim();
    body.writerTag = createWriterTag(request);
    return NextResponse.json({ data: await saveComment("projects", id, body) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
