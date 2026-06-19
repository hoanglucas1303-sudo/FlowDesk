"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  CheckCircle,
  Search,
  Key,
  CreditCard,
  Globe,
  Server,
  Mail,
  FileText,
  X,
} from "lucide-react";
import type { Subscription, Credential } from "@/types";

const brands: Record<
  string,
  { label: string; bg: string; color: string; content: React.ReactNode }
> = {
  chatgpt: {
    label: "ChatGPT",
    bg: "bg-emerald-500/10 border border-emerald-500/20",
    color: "text-emerald-500",
    content: <span className="font-extrabold text-[11px]">GPT</span>,
  },
  claude: {
    label: "Claude AI",
    bg: "bg-[#d9775f]/15 border border-[#d9775f]/30",
    color: "text-[#d9775f]",
    content: <span className="font-extrabold text-[11px]">Cld</span>,
  },
  codex: {
    label: "OpenAI Codex",
    bg: "bg-[#10a37f]/10 border border-[#10a37f]/20",
    color: "text-[#10a37f]",
    content: <span className="font-extrabold text-[10px]">Cdx</span>,
  },
  gemini: {
    label: "Google Gemini",
    bg: "bg-blue-500/10 border border-blue-500/20",
    color: "text-blue-500 dark:text-blue-400",
    content: <span className="font-extrabold text-[11px]">Gem</span>,
  },
  antigravity: {
    label: "Antigravity",
    bg: "bg-pink-500/10 border border-pink-500/20",
    color: "text-pink-500",
    content: <span className="font-extrabold text-[11px]">Ag</span>,
  },
  cursor: {
    label: "Cursor Editor",
    bg: "bg-neutral-500/10 border border-neutral-500/25",
    color: "text-text-primary",
    content: <span className="font-extrabold text-[11px]">Csr</span>,
  },
  railway: {
    label: "Railway.app",
    bg: "bg-[#f43f5e]/10 border border-[#f43f5e]/20",
    color: "text-[#f43f5e]",
    content: <span className="font-extrabold text-[11px]">Rly</span>,
  },
  vercel: {
    label: "Vercel",
    bg: "bg-neutral-800/10 dark:bg-white/10 border border-border",
    color: "text-text-primary",
    content: <span className="text-sm font-bold leading-none">▲</span>,
  },
  copilot: {
    label: "GitHub Copilot",
    bg: "bg-[#24292f]/10 dark:bg-white/10 border border-border",
    color: "text-text-primary",
    content: <span className="font-extrabold text-[11px]">Cop</span>,
  },
};

function ServiceIcon({ icon, className }: { icon: string | null; className?: string }) {
  if (!icon) return <div className={cn("p-2 rounded-lg bg-bg-elevated w-9 h-9 flex items-center justify-center shrink-0 border border-border text-xs", className)}>📁</div>;

  const brand = brands[icon];
  if (brand) {
    return (
      <div className={cn("rounded-lg flex items-center justify-center font-bold select-none shrink-0 w-9 h-9", brand.bg, brand.color, className)}>
        {brand.content}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg flex items-center justify-center bg-bg-elevated border border-border select-none shrink-0 w-9 h-9 text-lg", className)}>
      {icon}
    </div>
  );
}

interface VaultClientProps {
  hasPin: boolean;
  initialSubscriptions: Subscription[];
  initialCredentials: Credential[];
}

export default function VaultClient({
  hasPin,
  initialSubscriptions,
  initialCredentials,
}: VaultClientProps) {
  // --- State ---
  const [isLocked, setIsLocked] = useState(true);
  const [hasPinState, setHasPinState] = useState(hasPin);
  const [pinCode, setPinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [mounted, setMounted] = useState(false);

  // App state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "credentials">("subscriptions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("Tất cả");
  const [selectedCredCategory, setSelectedCredCategory] = useState<string>("Tất cả");

  // Secrets visibility map
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  // Copy state for individual items (just for quick visual check)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<Credential | null>(null);

  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // --- PIN Keyboard Input Listener ---
  useEffect(() => {
    if (!isLocked || !mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in the setup input
      if (!hasPinState) return;

      if (e.key >= "0" && e.key <= "9") {
        setPinCode((prev) => {
          const next = prev + e.key;
          if (next.length === 4) {
            handleVerifyPin(next);
            return "";
          }
          if (next.length > 4) return prev;
          return next;
        });
      } else if (e.key === "Backspace") {
        setPinCode((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape") {
        setPinCode("");
        setError(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, hasPinState, mounted]);

  // --- PIN Operations ---
  const handleVerifyPin = async (enteredPin: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", pin: enteredPin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLocked(false);
        setPinCode("");
        toast.success("Mở khóa Két bảo mật thành công");
      } else {
        setError(data.error || "Mã PIN không chính xác");
        setPinCode("");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ");
      setPinCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPin = async (enteredPin: string) => {
    if (enteredPin.length < 4) {
      setError("Mã PIN phải có tối thiểu 4 số");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup", pin: enteredPin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHasPinState(true);
        setIsLocked(false);
        setPinCode("");
        toast.success("Thiết lập mã PIN thành công");
      } else {
        setError(data.error || "Không thể thiết lập mã PIN");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyClick = (key: string) => {
    if (!hasPinState) return;
    setError(null);
    setPinCode((prev) => {
      const next = prev + key;
      if (next.length === 4) {
        handleVerifyPin(next);
        return "";
      }
      if (next.length > 4) return prev;
      return next;
    });
  };

  // --- Copy Helper ---
  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Đã sao chép ${label}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSecret = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Metrics Estimator ---
  const activeSubs = useMemo(() => {
    return subscriptions.filter((sub) => sub.status === "Active");
  }, [subscriptions]);

  const totalMonthlyCostVND = useMemo(() => {
    let totalVND = 0;
    activeSubs.forEach((sub) => {
      let monthlyCost = sub.cost;
      if (sub.period === "weekly") {
        monthlyCost = sub.cost * 4.33;
      } else if (sub.period === "yearly") {
        monthlyCost = sub.cost / 12;
      }

      let costInVND = monthlyCost;
      if (sub.currency === "USD") {
        costInVND = monthlyCost * 25400; // 1 USD = 25,400 VND
      } else if (sub.currency === "EUR") {
        costInVND = monthlyCost * 27500; // 1 EUR = 27,500 VND
      }
      totalVND += costInVND;
    });
    return totalVND;
  }, [activeSubs]);

  const dueSoonCount = useMemo(() => {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);
    return activeSubs.filter((sub) => {
      if (!sub.renewalDate) return false;
      const renewal = new Date(sub.renewalDate);
      return renewal >= now && renewal <= next7Days;
    }).length;
  }, [activeSubs]);

  // --- Category lists ---
  const subCategories = ["Tất cả", "AI Models", "Online Services", "Licenses", "Khác"];
  const credCategories = ["Tất cả", "Hosting", "VPS", "Domain", "Email", "Website", "Khác"];

  // --- Filtered lists ---
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.notes?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesCategory = selectedSubCategory === "Tất cả" || sub.category === selectedSubCategory;
      return matchesSearch && matchesCategory;
    });
  }, [subscriptions, searchQuery, selectedSubCategory]);

  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      const matchesSearch = cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cred.notes?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (cred.url?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCredCategory === "Tất cả" || cred.category === selectedCredCategory;
      return matchesSearch && matchesCategory;
    });
  }, [credentials, searchQuery, selectedCredCategory]);

  // --- CRUD Functions ---
  const handleSaveSubscription = async (formData: Partial<Subscription>) => {
    try {
      const isEdit = !!editingSub;
      const url = isEdit ? `/api/subscriptions/${editingSub.id}` : "/api/subscriptions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      if (isEdit) {
        setSubscriptions((prev) => prev.map((sub) => (sub.id === editingSub.id ? data : sub)));
        toast.success("Đã cập nhật gói gia hạn");
      } else {
        setSubscriptions((prev) => [data, ...prev]);
        toast.success("Đã thêm gói gia hạn mới");
      }
      setIsSubModalOpen(false);
      setEditingSub(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu thông tin");
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa gói gia hạn này?")) return;
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
      toast.success("Đã xóa gói gia hạn");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  const handleSaveCredential = async (formData: Partial<Credential>) => {
    try {
      const isEdit = !!editingCred;
      const url = isEdit ? `/api/credentials/${editingCred.id}` : "/api/credentials";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      if (isEdit) {
        setCredentials((prev) => prev.map((cred) => (cred.id === editingCred.id ? data : cred)));
        toast.success("Đã cập nhật tài khoản");
      } else {
        setCredentials((prev) => [data, ...prev]);
        toast.success("Đã thêm tài khoản mới");
      }
      setIsCredModalOpen(false);
      setEditingCred(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu thông tin");
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tài khoản này?")) return;
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setCredentials((prev) => prev.filter((cred) => cred.id !== id));
      toast.success("Đã xóa tài khoản");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  // --- Render Lock Screen ---
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>

        <div
          className={cn(
            "w-full max-w-sm p-8 rounded-[16px] bg-bg-surface border border-border shadow-2xl transition-all duration-300",
            isShaking && "animate-shake border-danger"
          )}
        >
          {hasPinState ? (
            // Verify PIN
            <div className="flex flex-col text-center">
              <div className="mx-auto p-4 rounded-full bg-accent/10 text-accent mb-4">
                <Lock size={32} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Két Bảo Mật FlowDesk</h2>
              <p className="text-sm text-text-secondary mt-1 mb-6">
                Nhập mã PIN Master gồm 4 số để mở khóa dữ liệu bảo mật.
              </p>

              {/* Dots indicator */}
              <div className="flex justify-center gap-4 mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-4 h-4 rounded-full border border-border transition-all duration-150",
                      pinCode.length > index
                        ? "bg-accent scale-110 shadow-sm shadow-blue-500/50"
                        : "bg-bg-elevated"
                    )}
                  />
                ))}
              </div>

              {error && <p className="text-sm text-danger mb-4 font-medium">{error}</p>}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyClick(num.toString())}
                    disabled={isLoading}
                    className="h-14 rounded-full bg-bg-elevated border border-border text-lg font-semibold hover:bg-bg-surface active:scale-95 transition-all text-text-primary flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinCode("")}
                  disabled={isLoading}
                  className="h-14 rounded-full bg-bg-elevated border border-border text-sm font-medium hover:bg-bg-surface active:scale-95 transition-all text-text-muted flex items-center justify-center cursor-pointer select-none"
                >
                  Xóa
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick("0")}
                  disabled={isLoading}
                  className="h-14 rounded-full bg-bg-elevated border border-border text-lg font-semibold hover:bg-bg-surface active:scale-95 transition-all text-text-primary flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPinCode((prev) => prev.slice(0, -1))}
                  disabled={isLoading}
                  className="h-14 rounded-full bg-bg-elevated border border-border text-sm font-medium hover:bg-bg-surface active:scale-95 transition-all text-text-muted flex items-center justify-center cursor-pointer select-none"
                >
                  ⌫
                </button>
              </div>
            </div>
          ) : (
            // Setup PIN
            <div className="flex flex-col text-center">
              <div className="mx-auto p-4 rounded-full bg-warning/10 text-warning mb-4">
                <Unlock size={32} />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Thiết lập Két Bảo Mật</h2>
              <p className="text-sm text-text-secondary mt-1 mb-4">
                Tạo mã PIN Master gồm 4 số để bảo vệ thông tin hóa đơn bản quyền và tài khoản của bạn.
              </p>

              <div className="flex flex-col items-center gap-4 my-2">
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setPinCode(val);
                  }}
                  disabled={isLoading}
                  placeholder="Nhập 4 số"
                  className="w-40 text-center tracking-[0.5em] pl-[0.5em] text-2xl font-bold bg-bg-elevated border border-border rounded-[8px] h-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />

                {error && <p className="text-sm text-danger font-medium">{error}</p>}

                <Button
                  onClick={() => handleSetupPin(pinCode)}
                  disabled={pinCode.length < 4 || isLoading}
                  loading={isLoading}
                  className="w-full"
                >
                  Xác nhận thiết lập
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render Vault Dashboard ---
  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <Unlock className="text-accent h-6 w-6" />
            Gia hạn & Bảo mật
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Quản lý chi phí đăng ký dịch vụ, thông tin bản quyền và tài khoản bảo mật an toàn.
          </p>
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Lock size={14} />}
            onClick={() => {
              setIsLocked(true);
              setPinCode("");
              toast.info("Đã khóa Két bảo mật");
            }}
          >
            Khóa Két
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cost Estimation */}
        <div className="p-5 rounded-[12px] bg-bg-surface border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Ước tính chi phí / tháng</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="my-3 flex flex-wrap gap-x-4 gap-y-1 items-baseline">
            <span className="text-2xl font-bold text-text-primary">
              ₫{Math.round(totalMonthlyCostVND).toLocaleString("vi-VN")}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Quy đổi tương đương theo chu kỳ đăng ký (1$ ≈ 25.400đ, 1€ ≈ 27.500đ).
          </p>
        </div>

        {/* Total Active */}
        <div className="p-5 rounded-[12px] bg-bg-surface border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Dịch vụ hoạt động</span>
            <CreditCard size={16} className="text-accent" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-text-primary">{activeSubs.length}</span>
            <span className="text-sm text-text-secondary ml-1.5">dịch vụ</span>
          </div>
          <p className="text-xs text-text-muted">
            {activeSubs.filter((s) => s.autoRenew).length} dịch vụ tự động gia hạn.
          </p>
        </div>

        {/* Due soon */}
        <div
          className={cn(
            "p-5 rounded-[12px] bg-bg-surface border shadow-sm flex flex-col justify-between transition-colors",
            dueSoonCount > 0 ? "border-amber-500/30 bg-amber-500/5" : "border-border"
          )}
        >
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Sắp gia hạn (7 ngày)</span>
            <Calendar size={16} className={dueSoonCount > 0 ? "text-amber-500" : "text-text-muted"} />
          </div>
          <div className="my-3">
            <span
              className={cn(
                "text-2xl font-bold",
                dueSoonCount > 0 ? "text-amber-500" : "text-text-primary"
              )}
            >
              {dueSoonCount}
            </span>
            <span className="text-sm text-text-secondary ml-1.5 font-medium">dịch vụ sắp tới hạn</span>
          </div>
          <p className="text-xs text-text-muted">
            {dueSoonCount > 0 ? "Cần chuẩn bị số dư thanh toán." : "Không có hóa đơn cận kề."}
          </p>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex p-0.5 rounded-[8px] bg-bg-elevated border border-border w-fit shrink-0">
          <button
            onClick={() => {
              setActiveTab("subscriptions");
              setSearchQuery("");
            }}
            className={cn(
              "px-4 py-1.5 rounded-[6px] text-sm font-medium transition-all cursor-pointer",
              activeTab === "subscriptions"
                ? "bg-bg-surface text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Gia hạn & License
          </button>
          <button
            onClick={() => {
              setActiveTab("credentials");
              setSearchQuery("");
            }}
            className={cn(
              "px-4 py-1.5 rounded-[6px] text-sm font-medium transition-all cursor-pointer",
              activeTab === "credentials"
                ? "bg-bg-surface text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            Tài khoản bảo mật
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {activeTab === "subscriptions" ? (
            <Button
              size="sm"
              iconLeft={<Plus size={16} />}
              onClick={() => {
                setEditingSub(null);
                setIsSubModalOpen(true);
              }}
            >
              Thêm gói gia hạn
            </Button>
          ) : (
            <Button
              size="sm"
              iconLeft={<Plus size={16} />}
              onClick={() => {
                setEditingCred(null);
                setIsCredModalOpen(true);
              }}
            >
              Thêm tài khoản
            </Button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder={
              activeTab === "subscriptions"
                ? "Tìm theo tên, ghi chú..."
                : "Tìm theo dịch vụ, tài khoản..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-[8px] bg-bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar py-1">
          {activeTab === "subscriptions"
            ? subCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedSubCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer transition-colors",
                    selectedSubCategory === cat
                      ? "bg-accent/15 text-accent border-accent/35"
                      : "bg-bg-surface text-text-muted border-border hover:bg-bg-elevated hover:text-text-primary"
                  )}
                >
                  {cat}
                </button>
              ))
            : credCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCredCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer transition-colors",
                    selectedCredCategory === cat
                      ? "bg-accent/15 text-accent border-accent/35"
                      : "bg-bg-surface text-text-muted border-border hover:bg-bg-elevated hover:text-text-primary"
                  )}
                >
                  {cat}
                </button>
              ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "subscriptions" ? (
        // Subscriptions Tab
        filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16 bg-bg-surface border border-border rounded-[12px]">
            <CreditCard size={40} className="mx-auto text-text-muted opacity-50 mb-3" />
            <h3 className="text-lg font-bold text-text-primary">Không tìm thấy gói gia hạn</h3>
            <p className="text-sm text-text-muted mt-1">
              Thử tìm kiếm khác hoặc thêm mới gói gia hạn của bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((sub) => {
              const hasLicense = !!sub.licenseKey && sub.licenseKey.trim() !== "";
              const isSubActive = sub.status === "Active";
              const renewalDateObj = sub.renewalDate ? new Date(sub.renewalDate) : null;
              const isDueSoon =
                renewalDateObj &&
                isSubActive &&
                (renewalDateObj.getTime() - new Date().getTime()) / 86400000 <= 7;

              return (
                <div
                  key={sub.id}
                  className="bg-bg-surface border border-border rounded-[12px] p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 group relative"
                >
                  <div>
                    {/* Top Row: Category + Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        {sub.category}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider",
                          sub.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : sub.status === "Expired"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-neutral-500/10 text-neutral-500 border border-neutral-500/20"
                        )}
                      >
                        {sub.status === "Active"
                          ? "Hoạt động"
                          : sub.status === "Expired"
                          ? "Hết hạn"
                          : "Đã hủy"}
                      </span>
                    </div>

                    {/* Middle Row: Icon + Title + Cost */}
                    <div className="flex gap-3 mb-4 items-start">
                      <ServiceIcon icon={sub.icon} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-text-primary line-clamp-1" title={sub.name}>{sub.name}</h3>
                        <div className="text-lg font-extrabold text-text-primary mt-0.5 items-baseline flex gap-1">
                          {sub.currency === "VND"
                            ? `₫${Math.round(sub.cost).toLocaleString("vi-VN")}`
                            : `${sub.currency === "EUR" ? "€" : "$"}${sub.cost}`}
                          <span className="text-xs font-semibold text-text-muted normal-case font-normal">
                            / {sub.period === "monthly" ? "tháng" : sub.period === "yearly" ? "năm" : "tuần"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-text-secondary border-t border-border pt-3">
                      {sub.renewalDate && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-text-muted">
                            <Calendar size={13} /> Gia hạn tiếp:
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              isDueSoon ? "text-amber-500" : "text-text-primary"
                            )}
                          >
                            {formatDate(sub.renewalDate)}
                          </span>
                        </div>
                      )}

                      {sub.paymentMethod && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-text-muted">
                            <CreditCard size={13} /> Thanh toán:
                          </span>
                          <span className="font-semibold text-text-primary">{sub.paymentMethod}</span>
                        </div>
                      )}

                      {/* License Key hidden element */}
                      {hasLicense && (
                        <div className="space-y-1 border-t border-border/50 pt-2.5 mt-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-text-muted font-medium flex items-center gap-1.5">
                              <Key size={13} /> License Key:
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleSecret(sub.id)}
                                className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                title={showSecrets[sub.id] ? "Ẩn Key" : "Hiện Key"}
                              >
                                {showSecrets[sub.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                onClick={() => handleCopy(sub.licenseKey || "", sub.id, "License Key")}
                                className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                title="Sao chép"
                              >
                                {copiedId === sub.id ? (
                                  <Check className="text-emerald-500" size={13} />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="font-mono text-center py-1.5 px-2 bg-bg-elevated border border-border/60 rounded-[6px] tracking-wider text-text-primary truncate">
                            {showSecrets[sub.id] ? sub.licenseKey : "••••••••••••••••••••"}
                          </div>
                        </div>
                      )}

                      {sub.notes && (
                        <div className="border-t border-border/50 pt-2.5 mt-2 text-text-muted italic line-clamp-2">
                          "{sub.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (reveal on hover) */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                    <button
                      onClick={() => {
                        setEditingSub(sub);
                        setIsSubModalOpen(true);
                      }}
                      className="p-1.5 rounded-[6px] text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all cursor-pointer"
                      title="Sửa"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="p-1.5 rounded-[6px] text-text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Credentials Tab
        filteredCredentials.length === 0 ? (
          <div className="text-center py-16 bg-bg-surface border border-border rounded-[12px]">
            <Key size={40} className="mx-auto text-text-muted opacity-50 mb-3" />
            <h3 className="text-lg font-bold text-text-primary">Không tìm thấy tài khoản</h3>
            <p className="text-sm text-text-muted mt-1">
              Thử tìm kiếm khác hoặc thêm mới tài khoản của bạn.
            </p>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border rounded-[12px] overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-elevated/40 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-4">Dịch vụ</th>
                    <th className="py-3 px-4">URL</th>
                    <th className="py-3 px-4">Tài khoản</th>
                    <th className="py-3 px-4">Mật khẩu / Key</th>
                    <th className="py-3 px-4">Ghi chú</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCredentials.map((cred) => {
                    const hasLink = !!cred.url && cred.url.trim() !== "";
                    return (
                      <tr key={cred.id} className="hover:bg-bg-elevated/10 transition-colors text-sm">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-text-primary">{cred.name}</div>
                          <span className="text-[10px] uppercase font-bold text-text-muted">
                            {cred.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate">
                          {hasLink ? (
                            <a
                              href={cred.url!.startsWith("http") ? cred.url! : `https://${cred.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent hover:underline flex items-center gap-1 w-fit"
                            >
                              <span className="truncate max-w-[150px]">{cred.url}</span>
                              <ExternalLink size={12} className="shrink-0" />
                            </a>
                          ) : (
                            <span className="text-text-muted italic">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-text-primary">{cred.username}</span>
                            <button
                              onClick={() => handleCopy(cred.username, cred.id + "-u", "Tên đăng nhập")}
                              className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                              title="Copy"
                            >
                              {copiedId === cred.id + "-u" ? (
                                <Check className="text-emerald-500" size={13} />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary tracking-wide">
                              {showSecrets[cred.id] ? cred.secret : "••••••••••••"}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => toggleSecret(cred.id)}
                                className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                title={showSecrets[cred.id] ? "Ẩn" : "Hiện"}
                              >
                                {showSecrets[cred.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                onClick={() => handleCopy(cred.secret, cred.id + "-s", "Mật khẩu")}
                                className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                title="Copy"
                              >
                                {copiedId === cred.id + "-s" ? (
                                  <Check className="text-emerald-500" size={13} />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate text-text-muted italic">
                          {cred.notes || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCred(cred);
                                setIsCredModalOpen(true);
                              }}
                              className="p-1.5 rounded-[6px] text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                              title="Sửa"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCredential(cred.id)}
                              className="p-1.5 rounded-[6px] text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-border">
              {filteredCredentials.map((cred) => {
                const hasLink = !!cred.url && cred.url.trim() !== "";
                return (
                  <div key={cred.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-text-primary text-base">{cred.name}</h3>
                        <span className="text-[10px] uppercase font-bold text-text-muted">
                          {cred.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCred(cred);
                            setIsCredModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-bg-elevated text-text-muted cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteCredential(cred.id)}
                          className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {hasLink && (
                      <div className="text-xs">
                        <span className="text-text-muted">Liên kết: </span>
                        <a
                          href={cred.url!.startsWith("http") ? cred.url! : `https://${cred.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          {cred.url} <ExternalLink size={11} />
                        </a>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Username */}
                      <div className="p-2.5 rounded-[6px] bg-bg-elevated/40 border border-border/60">
                        <div className="text-text-muted font-medium mb-1">Tài khoản</div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary truncate">{cred.username}</span>
                          <button
                            onClick={() => handleCopy(cred.username, cred.id + "-u", "Tên đăng nhập")}
                            className="p-0.5 text-text-muted cursor-pointer"
                          >
                            {copiedId === cred.id + "-u" ? (
                              <Check className="text-emerald-500" size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="p-2.5 rounded-[6px] bg-bg-elevated/40 border border-border/60">
                        <div className="text-text-muted font-medium mb-1">Mật khẩu</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-text-primary truncate font-semibold">
                            {showSecrets[cred.id] ? cred.secret : "••••••••"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleSecret(cred.id)}
                              className="p-0.5 text-text-muted cursor-pointer"
                            >
                              {showSecrets[cred.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={() => handleCopy(cred.secret, cred.id + "-s", "Mật khẩu")}
                              className="p-0.5 text-text-muted cursor-pointer"
                            >
                              {copiedId === cred.id + "-s" ? (
                                <Check className="text-emerald-500" size={13} />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {cred.notes && (
                      <div className="text-xs text-text-muted italic p-2 bg-bg-elevated/30 rounded border border-border/40">
                        "{cred.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* --- MODALS RENDERED VIA PORTAL --- */}
      {isSubModalOpen && (
        <SubscriptionModal
          sub={editingSub}
          onClose={() => {
            setIsSubModalOpen(false);
            setEditingSub(null);
          }}
          onSave={handleSaveSubscription}
        />
      )}

      {isCredModalOpen && (
        <CredentialModal
          cred={editingCred}
          onClose={() => {
            setIsCredModalOpen(false);
            setEditingCred(null);
          }}
          onSave={handleSaveCredential}
        />
      )}
    </div>
  );
}

// ── SUBSCRIPTION MODAL COMPONENT (PORTAL) ───────────────────────

interface SubscriptionModalProps {
  sub: Subscription | null;
  onClose: () => void;
  onSave: (data: Partial<Subscription>) => Promise<void>;
}

function SubscriptionModal({ sub, onClose, onSave }: SubscriptionModalProps) {
  const [name, setName] = useState(sub?.name || "");
  const [category, setCategory] = useState(sub?.category || "AI Models");
  const [icon, setIcon] = useState(sub?.icon || "📁");
  const [cost, setCost] = useState(sub?.cost?.toString() || "0");
  const [currency, setCurrency] = useState(sub?.currency || "USD");
  const [period, setPeriod] = useState(sub?.period || "monthly");
  const [autoRenew, setAutoRenew] = useState(sub?.autoRenew !== undefined ? sub.autoRenew : true);
  const [renewalDate, setRenewalDate] = useState(sub?.renewalDate ? sub.renewalDate.split("T")[0] : "");
  const [paymentMethod, setPaymentMethod] = useState(sub?.paymentMethod || "");
  const [status, setStatus] = useState(sub?.status || "Active");
  const [licenseKey, setLicenseKey] = useState(sub?.licenseKey || "");
  const [notes, setNotes] = useState(sub?.notes || "");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name,
        category,
        icon,
        cost: parseFloat(cost) || 0,
        currency,
        period,
        autoRenew,
        renewalDate: renewalDate ? new Date(renewalDate).toISOString() : null,
        paymentMethod,
        status,
        licenseKey,
        notes,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-[12px] bg-bg-surface border border-border shadow-2xl animate-fade-in-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-bg-surface z-10">
          <h3 className="text-lg font-bold text-text-primary">
            {sub ? "Chỉnh sửa gói gia hạn" : "Thêm gói gia hạn mới"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-[6px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Tên dịch vụ / gói đăng ký *"
            placeholder="Ví dụ: ChatGPT Plus, GitHub Copilot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Phân loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="AI Models">AI Models</option>
                <option value="Online Services">Online Services</option>
                <option value="Licenses">Licenses</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Active">Hoạt động</option>
                <option value="Expired">Hết hạn</option>
                <option value="Cancelled">Đã huỷ</option>
              </select>
            </div>
          </div>

          {/* Icon/Logo Picker */}
          <div className="p-3.5 rounded-[8px] bg-bg-elevated/20 border border-border space-y-3">
            <label className="text-sm font-medium text-text-primary block">Biểu tượng / Logo đại diện</label>
            
            <div className="flex items-center gap-3">
              <ServiceIcon icon={icon} />
              <div>
                <span className="text-[11px] text-text-muted block font-medium uppercase tracking-wider">Đang chọn</span>
                <span className="text-sm font-bold text-text-primary">
                  {brands[icon] ? brands[icon].label : `Emoji: ${icon}`}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Các dịch vụ của anh</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "chatgpt", label: "ChatGPT" },
                  { key: "claude", label: "Claude" },
                  { key: "codex", label: "Codex" },
                  { key: "gemini", label: "Gemini" },
                  { key: "antigravity", label: "Antigravity" },
                  { key: "cursor", label: "Cursor" },
                  { key: "railway", label: "Railway" },
                  { key: "vercel", label: "Vercel" },
                  { key: "copilot", label: "Copilot" }
                ].map((brand) => (
                  <button
                    key={brand.key}
                    type="button"
                    onClick={() => setIcon(brand.key)}
                    className={cn(
                      "px-2.5 py-1 rounded-[6px] text-xs font-semibold border transition-all cursor-pointer",
                      icon === brand.key
                        ? "bg-accent text-white border-accent"
                        : "bg-bg-elevated text-text-secondary border-border hover:text-text-primary hover:bg-bg-surface"
                    )}
                  >
                    {brand.label}
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted pt-1">Emoji nhanh</div>
              <div className="flex flex-wrap gap-1">
                {["📁", "🤖", "💻", "✨", "🛸", "🎯", "🚂", "🐙", "💳", "🌐", "💼", "🔑"].map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setIcon(emo)}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-[4px] text-sm border transition-all cursor-pointer",
                      icon === emo
                        ? "bg-accent border-accent text-white scale-105"
                        : "bg-bg-elevated border-border hover:bg-bg-surface"
                    )}
                  >
                    {emo}
                  </button>
                ))}
              </div>

              <div className="pt-1 flex gap-2 items-center">
                <span className="text-xs text-text-muted font-medium shrink-0">Nhập Emoji khác:</span>
                <input
                  type="text"
                  maxLength={10}
                  value={!brands[icon] ? icon : ""}
                  onChange={(e) => setIcon(e.target.value || "📁")}
                  placeholder="Ví dụ: 🚀"
                  className="h-8 w-24 rounded-[6px] px-2 text-center text-xs bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label="Mức phí *"
                type="number"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Tiền tệ</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Chu kỳ</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="weekly">Tuần</option>
                <option value="monthly">Tháng</option>
                <option value="yearly">Năm</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Ngày gia hạn tiếp theo</label>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <Input
                label="Cổng / Thẻ thanh toán"
                placeholder="Ví dụ: Visa **1234, MoMo"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-border bg-bg-elevated text-accent focus:ring-accent"
            />
            <label htmlFor="autoRenew" className="text-sm font-medium text-text-primary select-none cursor-pointer">
              Tự động gia hạn khi hết hạn
            </label>
          </div>

          <Input
            label="License Key (Nếu có)"
            placeholder="Dán key kích hoạt ở đây..."
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú thêm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[80px] rounded-[8px] p-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Huỷ
            </Button>
            <Button type="submit" loading={saving} disabled={!name.trim()}>
              {sub ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── CREDENTIAL MODAL COMPONENT (PORTAL) ─────────────────────────

interface CredentialModalProps {
  cred: Credential | null;
  onClose: () => void;
  onSave: (data: Partial<Credential>) => Promise<void>;
}

function CredentialModal({ cred, onClose, onSave }: CredentialModalProps) {
  const [name, setName] = useState(cred?.name || "");
  const [category, setCategory] = useState(cred?.category || "Hosting");
  const [url, setUrl] = useState(cred?.url || "");
  const [username, setUsername] = useState(cred?.username || "");
  const [secret, setSecret] = useState(cred?.secret || "");
  const [notes, setNotes] = useState(cred?.notes || "");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !secret.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name,
        category,
        url,
        username,
        secret,
        notes,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-[12px] bg-bg-surface border border-border shadow-2xl animate-fade-in-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-bg-surface z-10">
          <h3 className="text-lg font-bold text-text-primary">
            {cred ? "Chỉnh sửa tài khoản bảo mật" : "Thêm tài khoản bảo mật mới"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-[6px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Tên dịch vụ / Hệ thống *"
            placeholder="Ví dụ: AWS Console, VPS Vultr, Admin Web"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Phân loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Hosting">Hosting</option>
                <option value="VPS">VPS</option>
                <option value="Domain">Domain</option>
                <option value="Email">Email</option>
                <option value="Website">Website</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <Input
                label="Đường dẫn URL"
                placeholder="Ví dụ: aws.amazon.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên đăng nhập / Email *"
              placeholder="Username hoặc địa chỉ email..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Mật khẩu / Key đăng nhập *"
              type="text"
              placeholder="Nhập password hoặc secret key..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary block mb-1.5">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú thêm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[80px] rounded-[8px] p-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Huỷ
            </Button>
            <Button type="submit" loading={saving} disabled={!name.trim() || !username.trim() || !secret.trim()}>
              {cred ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
