import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/api/admin";
import { saveSetting } from "@/lib/supabase/community-repository";
import type { AboutSettings, DashboardSettings } from "@/lib/types";

export async function PUT(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { key } = await context.params;
  if (key !== "dashboard" && key !== "about") return NextResponse.json({ message: "지원하지 않는 설정입니다." }, { status: 404 });
  try {
    const value = await request.json() as DashboardSettings | AboutSettings;
    return NextResponse.json({ data: await saveSetting(key, value) });
  } catch (error) {
    return apiError(error);
  }
}
