// ── Vietnamese labels ──────────────────────────────────────────

export const TASK_STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Chờ xử lý",
  TODO: "Cần làm",
  IN_PROGRESS: "Đang làm",
  REVIEW: "Đang duyệt",
  DONE: "Hoàn thành",
};

export const TASK_STATUS_ORDER = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22C55E",
  MEDIUM: "#EAB308",
  HIGH: "#F97316",
  URGENT: "#EF4444",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  BACKLOG: "#6B7280",
  TODO: "#3B82F6",
  IN_PROGRESS: "#F59E0B",
  REVIEW: "#8B5CF6",
  DONE: "#10B981",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  ARCHIVED: "Đã lưu trữ",
};

// ── UI Labels ──────────────────────────────────────────────────

export const UI = {
  // Navigation
  dashboard: "Tổng quan",
  projects: "Dự án",
  documents: "Tài liệu",
  tasks: "Công việc",
  settings: "Cài đặt",
  vault: "Gia hạn & Bảo mật",
  search: "Tìm kiếm",
  searchPlaceholder: "Tìm kiếm trang, công việc...",

  // Actions
  newProject: "Dự án mới",
  newPage: "Trang mới",
  newTask: "Việc mới",
  save: "Lưu",
  cancel: "Huỷ",
  delete: "Xoá",
  edit: "Sửa",
  archive: "Lưu trữ",
  duplicate: "Nhân bản",
  moveTo: "Di chuyển đến",
  rename: "Đổi tên",

  // Confirmations
  confirmDelete: "Bạn chắc chắn muốn xoá?",
  confirmArchive: "Bạn chắc chắn muốn lưu trữ?",

  // States
  loading: "Đang tải...",
  saving: "Đang lưu...",
  saved: "Đã lưu",
  noResults: "Không có kết quả",
  empty: "Chưa có dữ liệu",

  // Page editor
  untitledPage: "Trang mới",
  typePlaceholder: "Nhập '/' để xem lệnh...",

  // Project
  overview: "Tổng quan",
  projectDescription: "Mô tả dự án",
  totalTasks: "Tổng công việc",
  completedTasks: "Đã hoàn thành",
  overdueTasks: "Quá hạn",
  recentPages: "Trang gần đây",
  pinnedPages: "Trang ghim",

  // Task
  dueDate: "Hạn chót",
  priority: "Độ ưu tiên",
  labels: "Nhãn",
  assignedPage: "Tài liệu liên quan",
  noDescription: "Chưa có mô tả",

  // Auth
  login: "Đăng nhập",
  logout: "Đăng xuất",
  email: "Email",
  password: "Mật khẩu",
  loginTitle: "Đăng nhập FlowDesk",
  loginSubtitle: "Quản lý dự án & tài liệu thông minh",

  // Misc
  appName: "FlowDesk",
  appTagline: "Quản lý dự án & tài liệu thông minh",
  darkMode: "Chế độ tối",
  lightMode: "Chế độ sáng",
} as const;

// ── Project icon options ───────────────────────────────────────

export const PROJECT_ICONS = [
  "📁", "🚀", "💼", "🎯", "📊", "🏗️", "💡", "🔧",
  "📱", "🌐", "🎨", "📝", "🔬", "📈", "🤖", "🛒",
  "📦", "🎓", "🏠", "⚡", "🔒", "🎮", "🎵", "📷",
];

export const PROJECT_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
  "#E11D48", "#7C3AED",
];

// ── Page icon options ──────────────────────────────────────────

export const PAGE_ICONS = [
  "📄", "📝", "📋", "📑", "📖", "📘", "📓", "📒",
  "💡", "🔖", "📌", "🗂️", "📊", "📈", "🗒️", "✏️",
];
