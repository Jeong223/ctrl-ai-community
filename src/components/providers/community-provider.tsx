"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seedData } from "@/data/seed";
import { useSession } from "@/components/providers/session-provider";
import type { AboutSettings, CommunityComment, CommunityData, DashboardSettings, Gathering, KnowledgePost, Member, Notice, ProjectRoom, ProjectUpdate } from "@/lib/types";

type Feedback = { tone: "success" | "error"; text: string } | null;
type AsyncResult = Promise<boolean>;

type CommunityContextValue = {
  data: CommunityData;
  hydrated: boolean;
  loading: boolean;
  saving: boolean;
  feedback: Feedback;
  clearFeedback: () => void;
  refreshData: () => Promise<void>;
  saveAbout: (settings: AboutSettings) => AsyncResult;
  saveDashboard: (settings: DashboardSettings) => AsyncResult;
  saveMember: (member: Member) => AsyncResult;
  removeMember: (id: string) => AsyncResult;
  saveNotice: (notice: Notice) => AsyncResult;
  removeNotice: (id: string) => AsyncResult;
  saveKnowledge: (post: KnowledgePost) => AsyncResult;
  removeKnowledge: (id: string) => AsyncResult;
  addKnowledgeComment: (postId: string, comment: CommunityComment) => AsyncResult;
  removeKnowledgeComment: (postId: string, commentId: string) => AsyncResult;
  saveProject: (project: ProjectRoom) => AsyncResult;
  removeProject: (id: string) => AsyncResult;
  addProjectUpdate: (projectId: string, update: ProjectUpdate) => AsyncResult;
  saveProjectUpdate: (projectId: string, update: ProjectUpdate) => AsyncResult;
  removeProjectUpdate: (projectId: string, updateId: string) => AsyncResult;
  addProjectComment: (projectId: string, comment: CommunityComment) => AsyncResult;
  removeProjectComment: (projectId: string, commentId: string) => AsyncResult;
  saveGathering: (gathering: Gathering) => AsyncResult;
  removeGathering: (id: string) => AsyncResult;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

function upsert<T extends { id: string }>(items: T[], item: T) {
  return items.some((current) => current.id === item.id)
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items];
}

async function requestData<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({ message: "서버 응답을 읽지 못했습니다." }));
  if (!response.ok) throw new Error(payload.message ?? "요청을 처리하지 못했습니다.");
  return payload.data as T;
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, role } = useSession();
  const [data, setData] = useState<CommunityData>(seedData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await requestData<CommunityData>("/api/community", { cache: "no-store" }));
      setFeedback(null);
    } catch (error) {
      setFeedback({ tone: "error", text: `${error instanceof Error ? error.message : "공용 데이터를 불러오지 못했습니다."} 현재 화면에는 익명 예시 데이터가 표시됩니다.` });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { void refreshData(); });
  }, [refreshData]);

  const perform = useCallback(async <T,>(message: string, action: () => Promise<T>, allowMember = false) => {
    if (!isAdmin && !(allowMember && role === "member")) {
      setFeedback({ tone: "error", text: "이 작업을 수행할 권한이 없습니다." });
      return { ok: false, value: undefined as T | undefined };
    }
    setSaving(true);
    try {
      const value = await action();
      setFeedback({ tone: "success", text: message });
      return { ok: true, value };
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "저장에 실패했습니다." });
      return { ok: false, value: undefined as T | undefined };
    } finally {
      setSaving(false);
    }
  }, [isAdmin, role]);

  const saveDashboard = useCallback(async (dashboard: DashboardSettings) => {
    const result = await perform("대시보드 문구를 공용 DB에 저장했습니다.", () => requestData<DashboardSettings>("/api/settings/dashboard", { method: "PUT", body: JSON.stringify(dashboard) }));
    if (result.ok && result.value) setData((current) => ({ ...current, dashboard: result.value! }));
    return result.ok;
  }, [perform]);

  const saveAbout = useCallback(async (about: AboutSettings) => {
    const result = await perform("동호회 소개 문구를 공용 DB에 저장했습니다.", () => requestData<AboutSettings>("/api/settings/about", { method: "PUT", body: JSON.stringify(about) }));
    if (result.ok && result.value) setData((current) => ({ ...current, about: result.value! }));
    return result.ok;
  }, [perform]);

  const saveNotice = useCallback(async (notice: Notice) => {
    const result = await perform("공지사항을 저장했습니다.", () => requestData<Notice>(notice.id ? `/api/notices/${notice.id}` : "/api/notices", { method: notice.id ? "PUT" : "POST", body: JSON.stringify(notice) }));
    if (result.ok && result.value) setData((current) => ({ ...current, notices: upsert(current.notices, result.value!) }));
    return result.ok;
  }, [perform]);

  const removeNotice = useCallback(async (id: string) => {
    const result = await perform("공지사항을 삭제했습니다.", () => requestData<void>(`/api/notices/${id}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, notices: current.notices.filter((item) => item.id !== id) }));
    return result.ok;
  }, [perform]);

  const saveKnowledge = useCallback(async (post: KnowledgePost) => {
    const result = await perform("정보공유 글을 저장했습니다.", () => requestData<KnowledgePost>(post.id ? `/api/knowledge/${post.id}` : "/api/knowledge", { method: post.id ? "PUT" : "POST", body: JSON.stringify(post) }), !post.id);
    if (result.ok && result.value) setData((current) => ({ ...current, knowledge: upsert(current.knowledge, { ...result.value!, comments: post.comments }) }));
    return result.ok;
  }, [perform]);

  const addKnowledgeComment = useCallback(async (postId: string, comment: CommunityComment) => {
    const result = await perform("댓글을 등록했습니다.", () => requestData<CommunityComment>(`/api/knowledge/${postId}/comments`, { method: "POST", body: JSON.stringify(comment) }), true);
    if (result.ok && result.value) setData((current) => ({ ...current, knowledge: current.knowledge.map((post) => post.id === postId ? { ...post, comments: [...post.comments, result.value!] } : post) }));
    return result.ok;
  }, [perform]);

  const removeKnowledgeComment = useCallback(async (postId: string, commentId: string) => {
    const result = await perform("댓글을 삭제했습니다.", () => requestData<void>(`/api/knowledge/${postId}/comments/${commentId}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, knowledge: current.knowledge.map((post) => post.id === postId ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) } : post) }));
    return result.ok;
  }, [perform]);

  const removeKnowledge = useCallback(async (id: string) => {
    const result = await perform("정보공유 글을 삭제했습니다.", () => requestData<void>(`/api/knowledge/${id}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, knowledge: current.knowledge.filter((item) => item.id !== id) }));
    return result.ok;
  }, [perform]);

  const saveProject = useCallback(async (project: ProjectRoom) => {
    const result = await perform("프로젝트를 저장했습니다.", () => requestData<ProjectRoom>(project.id ? `/api/projects/${project.id}` : "/api/projects", { method: project.id ? "PUT" : "POST", body: JSON.stringify(project) }), true);
    if (result.ok && result.value) {
      const saved = { ...result.value, updates: project.updates, comments: project.comments };
      setData((current) => ({ ...current, projects: upsert(current.projects, saved) }));
    }
    return result.ok;
  }, [perform]);

  const removeProject = useCallback(async (id: string) => {
    const result = await perform("프로젝트를 삭제했습니다.", () => requestData<void>(`/api/projects/${id}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id) }));
    return result.ok;
  }, [perform]);

  const addProjectUpdate = useCallback(async (projectId: string, update: ProjectUpdate) => {
    const result = await perform("프로젝트 진행사항을 저장했습니다.", () => requestData<ProjectUpdate>(`/api/projects/${projectId}/updates`, { method: "POST", body: JSON.stringify(update) }), true);
    if (result.ok && result.value) setData((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, updates: [result.value!, ...project.updates] } : project) }));
    return result.ok;
  }, [perform]);

  const saveProjectUpdate = useCallback(async (projectId: string, update: ProjectUpdate) => {
    const result = await perform("프로젝트 진행사항을 수정했습니다.", () => requestData<ProjectUpdate>(`/api/projects/${projectId}/updates/${update.id}`, { method: "PUT", body: JSON.stringify(update) }));
    if (result.ok && result.value) setData((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, updates: project.updates.map((item) => item.id === update.id ? result.value! : item) } : project) }));
    return result.ok;
  }, [perform]);

  const removeProjectUpdate = useCallback(async (projectId: string, updateId: string) => {
    const result = await perform("프로젝트 진행사항을 삭제했습니다.", () => requestData<void>(`/api/projects/${projectId}/updates/${updateId}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, updates: project.updates.filter((item) => item.id !== updateId) } : project) }));
    return result.ok;
  }, [perform]);

  const addProjectComment = useCallback(async (projectId: string, comment: CommunityComment) => {
    const result = await perform("프로젝트 댓글을 등록했습니다.", () => requestData<CommunityComment>(`/api/projects/${projectId}/comments`, { method: "POST", body: JSON.stringify(comment) }), true);
    if (result.ok && result.value) setData((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, comments: [...project.comments, result.value!] } : project) }));
    return result.ok;
  }, [perform]);

  const removeProjectComment = useCallback(async (projectId: string, commentId: string) => {
    const result = await perform("프로젝트 댓글을 삭제했습니다.", () => requestData<void>(`/api/projects/${projectId}/comments/${commentId}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, comments: project.comments.filter((comment) => comment.id !== commentId) } : project) }));
    return result.ok;
  }, [perform]);

  const saveGathering = useCallback(async (gathering: Gathering) => {
    const result = await perform("모임 일정을 저장했습니다.", () => requestData<Gathering>(gathering.id ? `/api/gatherings/${gathering.id}` : "/api/gatherings", { method: gathering.id ? "PUT" : "POST", body: JSON.stringify(gathering) }));
    if (result.ok && result.value) setData((current) => ({ ...current, gatherings: upsert(current.gatherings, result.value!) }));
    return result.ok;
  }, [perform]);

  const removeGathering = useCallback(async (id: string) => {
    const result = await perform("모임 일정을 삭제했습니다.", () => requestData<void>(`/api/gatherings/${id}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, gatherings: current.gatherings.filter((item) => item.id !== id) }));
    return result.ok;
  }, [perform]);

  const saveMember = useCallback(async (member: Member) => {
    const result = await perform("회원정보를 저장했습니다.", () => requestData<Member>(member.id ? `/api/members/${member.id}` : "/api/members", { method: member.id ? "PUT" : "POST", body: JSON.stringify(member) }));
    if (result.ok && result.value) setData((current) => ({ ...current, members: upsert(current.members, result.value!) }));
    return result.ok;
  }, [perform]);

  const removeMember = useCallback(async (id: string) => {
    const result = await perform("회원정보를 삭제했습니다.", () => requestData<void>(`/api/members/${id}`, { method: "DELETE" }));
    if (result.ok) setData((current) => ({ ...current, members: current.members.filter((item) => item.id !== id) }));
    return result.ok;
  }, [perform]);

  const value = useMemo(() => ({
    data, hydrated: !loading, loading, saving, feedback, clearFeedback: () => setFeedback(null), refreshData,
    saveAbout, saveDashboard, saveMember, removeMember, saveNotice, removeNotice, saveKnowledge, removeKnowledge, addKnowledgeComment, removeKnowledgeComment,
    saveProject, removeProject, addProjectUpdate, saveProjectUpdate, removeProjectUpdate, addProjectComment, removeProjectComment, saveGathering, removeGathering,
  }), [data, loading, saving, feedback, refreshData, saveAbout, saveDashboard, saveMember, removeMember, saveNotice, removeNotice, saveKnowledge, removeKnowledge, addKnowledgeComment, removeKnowledgeComment, saveProject, removeProject, addProjectUpdate, saveProjectUpdate, removeProjectUpdate, addProjectComment, removeProjectComment, saveGathering, removeGathering]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used inside CommunityProvider");
  return context;
}
