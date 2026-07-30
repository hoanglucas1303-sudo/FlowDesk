// ── Shared types for FlowDesk ──────────────────────────────────

export type Theme = "dark" | "light";

// ── Project ────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  status: "ACTIVE" | "ARCHIVED";
  sortOrder: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    pages: number;
    tasks: number;
  };
}

export interface ProjectWithDetails extends Project {
  pages: PageSummary[];
  tasks: TaskSummary[];
  labels: Label[];
}

// ── Page ───────────────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  content: unknown;
  icon: string;
  coverUrl: string | null;
  projectId: string;
  parentId: string | null;
  sortOrder: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageSummary {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
  sortOrder: number;
  isPinned: boolean;
  updatedAt: string;
}

export interface PageTreeNode extends PageSummary {
  children: PageTreeNode[];
}

// ── Task ───────────────────────────────────────────────────────

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  pageId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
  page?: { id: string; title: string; icon: string } | null;
  project?: { id: string; name: string; icon: string; color: string } | null;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  sortOrder: number;
}

// ── Label ──────────────────────────────────────────────────────

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

// ── Search ─────────────────────────────────────────────────────

export interface SearchResults {
  projects: Pick<Project, "id" | "name" | "icon" | "color">[];
  pages: Pick<Page, "id" | "title" | "icon" | "projectId">[];
  tasks: Pick<Task, "id" | "title" | "status" | "priority" | "projectId">[];
}

// ── API Response ───────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Dashboard Stats ────────────────────────────────────────────

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

// ── Vault Subscriptions & Credentials ──────────────────────────

export interface Subscription {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  cost: number;
  currency: string;
  period: string;
  autoRenew: boolean;
  renewalDate: string | null;
  paymentMethod: string | null;
  status: string;
  licenseKey: string | null;
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  name: string;
  category: string;
  url: string | null;
  username: string;
  secret: string;
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoAccount {
  role?: string;
  username?: string;
  password?: string;
  notes?: string;
}

export interface DemoDoc {
  name?: string;
  url?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  status: string;
  version: string;
  url: string | null;
  repoUrl: string | null;
  techStack: string | null;
  docsUrl: string | null;
  demoAccounts: DemoAccount[] | null;
  demoDocs: DemoDoc[] | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

