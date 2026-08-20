import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { seedData } from "@/data/seed";
import { safeCodeEqual } from "@/lib/auth";
import type {
  AboutSettings,
  CommunityData,
  DashboardSettings,
  Gathering,
  KnowledgePost,
  Member,
  Notice,
  ProjectRoom,
  ProjectUpdate,
} from "@/lib/types";

export type ResourceName = "notices" | "knowledge" | "projects" | "gatherings" | "members";

function ensureNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function noticeFromRow(row: Record<string, unknown>): Notice {
  return { id: String(row.id), title: String(row.title), content: String(row.content), category: row.category as Notice["category"], pinned: Boolean(row.pinned), createdAt: String(row.created_at), author: String(row.author ?? "운영진") };
}

function knowledgeFromRow(row: Record<string, unknown>): KnowledgePost {
  return { id: String(row.id), title: String(row.title), content: String(row.content), tags: (row.tags as string[]) ?? [], links: (row.links as string[]) ?? [], createdAt: String(row.created_at), author: String(row.author ?? "운영진") };
}

function updateFromRow(row: Record<string, unknown>): ProjectUpdate {
  return { id: String(row.id), title: String(row.title), content: String(row.content), createdAt: String(row.created_at) };
}

function projectFromRow(row: Record<string, unknown>, updates: ProjectUpdate[] = []): ProjectRoom {
  return {
    id: String(row.id), name: String(row.name), description: String(row.description ?? ""), members: (row.members as string[]) ?? [],
    status: row.status as ProjectRoom["status"], goal: String(row.goal ?? ""), nextAction: String(row.next_action ?? ""), updates,
    resources: (row.resources as ProjectRoom["resources"]) ?? [], checklist: (row.checklist as ProjectRoom["checklist"]) ?? [],
    meetingNotes: String(row.meeting_notes ?? ""), resultUrl: row.result_url ? String(row.result_url) : undefined,
  };
}

function gatheringFromRow(row: Record<string, unknown>): Gathering {
  return { id: String(row.id), title: String(row.title), date: String(row.date), time: row.time ? String(row.time) : undefined, place: row.place ? String(row.place) : undefined, memo: row.memo ? String(row.memo) : undefined, attendees: (row.attendees as string[]) ?? [], mapUrl: row.map_url ? String(row.map_url) : undefined };
}

function memberFromRow(row: Record<string, unknown>): Member {
  return { id: String(row.id), name: String(row.name), role: row.role ? String(row.role) : undefined, interest: row.interest ? String(row.interest) : undefined, aiTools: (row.ai_tools as string[]) ?? [], projects: (row.projects as string[]) ?? [], bio: row.bio ? String(row.bio) : undefined, initials: String(row.initials ?? "AI"), color: String(row.color ?? "blue") };
}

export async function getCommunityData(): Promise<CommunityData> {
  const client = createSupabaseAdminClient();
  const [notices, knowledge, projects, updates, gatherings, members, settings] = await Promise.all([
    client.from("notices").select("*").order("created_at", { ascending: false }),
    client.from("knowledge_posts").select("*").order("created_at", { ascending: false }),
    client.from("project_rooms").select("*").order("created_at", { ascending: false }),
    client.from("project_updates").select("*").order("created_at", { ascending: false }),
    client.from("gatherings").select("*").order("date", { ascending: true }),
    client.from("members").select("*").order("created_at", { ascending: true }),
    client.from("site_settings").select("key,value"),
  ]);
  [notices, knowledge, projects, updates, gatherings, members, settings].forEach((result) => ensureNoError(result.error));
  const updateRows = (updates.data ?? []) as Record<string, unknown>[];
  const settingMap = new Map((settings.data ?? []).map((row) => [row.key, row.value]));
  return {
    dashboard: (settingMap.get("dashboard") as DashboardSettings | undefined) ?? seedData.dashboard,
    about: (settingMap.get("about") as AboutSettings | undefined) ?? seedData.about,
    notices: ((notices.data ?? []) as Record<string, unknown>[]).map(noticeFromRow),
    knowledge: ((knowledge.data ?? []) as Record<string, unknown>[]).map(knowledgeFromRow),
    projects: ((projects.data ?? []) as Record<string, unknown>[]).map((row) => projectFromRow(row, updateRows.filter((item) => item.project_id === row.id).map(updateFromRow))),
    gatherings: ((gatherings.data ?? []) as Record<string, unknown>[]).map(gatheringFromRow),
    members: ((members.data ?? []) as Record<string, unknown>[]).map(memberFromRow),
  };
}

export async function findMemberByPersonalCode(code: string, suffix: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from("members")
    .select("id,name")
    .order("created_at", { ascending: true });
  ensureNoError(error);
  const member = (data ?? []).find((row) => safeCodeEqual(code, `${row.name}${suffix}`));
  return member ? { id: String(member.id), name: String(member.name) } : null;
}

function insertPayload(resource: ResourceName, item: Record<string, unknown>) {
  if (resource === "notices") return { title: item.title, content: item.content, category: item.category, pinned: Boolean(item.pinned), author: item.author };
  if (resource === "knowledge") return { title: item.title, content: item.content, tags: item.tags ?? [], links: item.links ?? [], author: item.author };
  if (resource === "projects") return { name: item.name, description: item.description, members: item.members ?? [], status: item.status, goal: item.goal, next_action: item.nextAction, resources: item.resources ?? [], checklist: item.checklist ?? [], meeting_notes: item.meetingNotes ?? "", result_url: item.resultUrl || null };
  if (resource === "gatherings") return { title: item.title, date: item.date, time: item.time || null, place: item.place || null, memo: item.memo || null, attendees: item.attendees ?? [], map_url: item.mapUrl || null };
  return { name: item.name, role: item.role || null, interest: item.interest || null, ai_tools: item.aiTools ?? [], projects: item.projects ?? [], bio: item.bio || null, initials: item.initials, color: item.color };
}

const tableFor: Record<ResourceName, string> = { notices: "notices", knowledge: "knowledge_posts", projects: "project_rooms", gatherings: "gatherings", members: "members" };

function mapSaved(resource: ResourceName, row: Record<string, unknown>) {
  if (resource === "notices") return noticeFromRow(row);
  if (resource === "knowledge") return knowledgeFromRow(row);
  if (resource === "projects") return projectFromRow(row);
  if (resource === "gatherings") return gatheringFromRow(row);
  return memberFromRow(row);
}

export async function saveResource(resource: ResourceName, item: Record<string, unknown>, id?: string) {
  const client = createSupabaseAdminClient();
  const payload = insertPayload(resource, item) as never;
  const query = id
    ? client.from(tableFor[resource]).update(payload).eq("id", id)
    : client.from(tableFor[resource]).insert(payload);
  const { data, error } = await query.select("*").single();
  ensureNoError(error);
  return mapSaved(resource, data as Record<string, unknown>);
}

export async function saveMemberProfile(id: string, item: Record<string, unknown>) {
  const payload = {
    interest: item.interest || null,
    ai_tools: Array.isArray(item.aiTools) ? item.aiTools : [],
    projects: Array.isArray(item.projects) ? item.projects : [],
    bio: item.bio || null,
  };
  const { data, error } = await createSupabaseAdminClient()
    .from("members")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  ensureNoError(error);
  return memberFromRow(data as Record<string, unknown>);
}

export async function removeResource(resource: ResourceName, id: string) {
  const { error } = await createSupabaseAdminClient().from(tableFor[resource]).delete().eq("id", id);
  ensureNoError(error);
}

export async function saveSetting(key: "dashboard" | "about", value: DashboardSettings | AboutSettings) {
  const { error } = await createSupabaseAdminClient().from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  ensureNoError(error);
  return value;
}

export async function saveProjectUpdate(projectId: string, update: Record<string, unknown>, id?: string) {
  const client = createSupabaseAdminClient();
  const payload = { project_id: projectId, title: update.title, content: update.content };
  const query = id ? client.from("project_updates").update(payload).eq("id", id).eq("project_id", projectId) : client.from("project_updates").insert(payload);
  const { data, error } = await query.select("*").single();
  ensureNoError(error);
  return updateFromRow(data as Record<string, unknown>);
}

export async function removeProjectUpdate(projectId: string, id: string) {
  const { error } = await createSupabaseAdminClient().from("project_updates").delete().eq("id", id).eq("project_id", projectId);
  ensureNoError(error);
}
