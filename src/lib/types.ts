export type NoticeCategory =
  | "정기모임"
  | "지원비"
  | "프로젝트"
  | "교육"
  | "행사"
  | "회칙"
  | "기타";

export type Notice = {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  pinned?: boolean;
  createdAt: string;
  author: string;
};

export type KnowledgePost = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links?: string[];
  createdAt: string;
  author: string;
};

export type ProjectStatus = "아이디어" | "기획" | "진행중" | "완료" | "보류";

export type ProjectUpdate = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type ProjectRoom = {
  id: string;
  name: string;
  description: string;
  members: string[];
  status: ProjectStatus;
  goal: string;
  nextAction: string;
  updates: ProjectUpdate[];
  resources: { label: string; url: string }[];
  checklist: ChecklistItem[];
  meetingNotes: string;
  resultUrl?: string;
};

export type Gathering = {
  id: string;
  title: string;
  date: string;
  time?: string;
  place?: string;
  memo?: string;
  attendees?: string[];
  mapUrl?: string;
};

export type Member = {
  id: string;
  name: string;
  role?: string;
  interest?: string;
  aiTools?: string[];
  projects?: string[];
  bio?: string;
  initials: string;
  color: string;
};

export type DashboardSettings = {
  kicker: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  monthlyFocus: string;
};

export type AboutTextItem = {
  id: string;
  title: string;
  description: string;
};

export type AboutSettings = {
  pageEyebrow: string;
  pageTitle: string;
  pageDescription: string;
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  values: AboutTextItem[];
  directionEyebrow: string;
  directionTitleLine1: string;
  directionTitleLine2: string;
  directionDescription: string;
  directions: AboutTextItem[];
  longTermTitle: string;
  longTermDescription: string;
  footerCards: AboutTextItem[];
};

export type CommunityData = {
  dashboard: DashboardSettings;
  about: AboutSettings;
  notices: Notice[];
  knowledge: KnowledgePost[];
  projects: ProjectRoom[];
  gatherings: Gathering[];
  members: Member[];
};
