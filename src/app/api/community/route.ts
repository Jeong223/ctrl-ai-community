import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/admin";
import { getCommunityData } from "@/lib/supabase/community-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await getCommunityData() });
  } catch (error) {
    return apiError(error);
  }
}
