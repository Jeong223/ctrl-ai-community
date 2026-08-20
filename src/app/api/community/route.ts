import { NextRequest, NextResponse } from "next/server";
import { apiError, requireContributor } from "@/lib/api/admin";
import { getCommunityData } from "@/lib/supabase/community-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireContributor(request);
  if (denied) return denied;
  try {
    return NextResponse.json({ data: await getCommunityData() });
  } catch (error) {
    return apiError(error);
  }
}
