"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Globe,
  GitBranch,
  BookOpen,
  User,
  Key,
  Shield,
  Activity,
} from "lucide-react";
import type { Product, DemoAccount, DemoDoc } from "@/types";

interface ProductionClientProps {
  initialProducts: Product[];
}

export default function ProductionClient({ initialProducts }: ProductionClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Password visibility map for demo accounts: key is `product.id-accountIndex`
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  // Copy feedback state: key is `id-accountIndex-field` or `docIndex`
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toast = useToast();

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Đã sao chép vào bộ nhớ tạm");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- CRUD Functions ---
  const handleSaveProduct = async (formData: Partial<Product>) => {
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      if (isEdit) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data : p)));
        toast.success("Đã cập nhật thông tin sản phẩm");
      } else {
        setProducts((prev) => [data, ...prev]);
        toast.success("Đã thêm sản phẩm mới thành công");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu sản phẩm");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xóa sản phẩm thành công");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể xóa");
    }
  };

  // --- Filtered products ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (p.techStack?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === "Tất cả" || p.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, selectedStatus]);

  // Status badge style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "Beta":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "Maintenance":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Dev":
        return "bg-neutral-500/10 text-neutral-500 border border-neutral-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-500 border border-neutral-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Active":
        return "Hoạt động";
      case "Beta":
        return "Thử nghiệm (Beta)";
      case "Maintenance":
        return "Bảo trì";
      case "Dev":
        return "Đang phát triển";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <Layers className="text-accent h-6 w-6" />
            Quản trị Production
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Quản lý các phần mềm chạy chính thức, phiên bản, tài liệu, tài khoản demo và tài nguyên sản phẩm.
          </p>
        </div>
        <div>
          <Button
            size="sm"
            iconLeft={<Plus size={16} />}
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            Thêm sản phẩm mới
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-[12px] bg-bg-surface border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng sản phẩm</span>
            <Layers size={16} className="text-accent" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-text-primary">{products.length}</span>
            <span className="text-sm text-text-secondary ml-1.5">sản phẩm</span>
          </div>
        </div>

        <div className="p-5 rounded-[12px] bg-bg-surface border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Hoạt động (Active)</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-emerald-500">
              {products.filter((p) => p.status === "Active").length}
            </span>
            <span className="text-sm text-text-secondary ml-1.5">đang chạy</span>
          </div>
        </div>

        <div className="p-5 rounded-[12px] bg-bg-surface border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tài khoản Demo</span>
            <User size={16} className="text-indigo-500" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-text-primary">
              {products.reduce((acc, p) => acc + (p.demoAccounts?.length || 0), 0)}
            </span>
            <span className="text-sm text-text-secondary ml-1.5">tài khoản</span>
          </div>
        </div>

        <div className="p-5 rounded-[12px] bg-bg-surface border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tài liệu Demo</span>
            <BookOpen size={16} className="text-amber-500" />
          </div>
          <div className="my-3">
            <span className="text-2xl font-bold text-text-primary">
              {products.reduce((acc, p) => acc + (p.demoDocs?.length || 0), 0)}
            </span>
            <span className="text-sm text-text-secondary ml-1.5 font-medium">tài liệu</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm sản phẩm, mô tả, công nghệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-[8px] bg-bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Status Category Filter */}
        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar py-1">
          {["Tất cả", "Active", "Beta", "Maintenance", "Dev"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer transition-colors",
                selectedStatus === status
                  ? "bg-accent/15 text-accent border-accent/35"
                  : "bg-bg-surface text-text-muted border-border hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              {status === "Tất cả" ? "Tất cả trạng thái" : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface border border-border rounded-[12px]">
          <Layers size={40} className="mx-auto text-text-muted opacity-50 mb-3" />
          <h3 className="text-lg font-bold text-text-primary">Chưa có sản phẩm nào</h3>
          <p className="text-sm text-text-muted mt-1">
            Không tìm thấy sản phẩm phù hợp. Nhấp vào nút "Thêm sản phẩm mới" để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onEdit={() => {
                setEditingProduct(prod);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDeleteProduct(prod.id)}
              showSecrets={showSecrets}
              toggleSecret={toggleSecret}
              copiedId={copiedId}
              handleCopy={handleCopy}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

// ── Product Card Component ──────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  showSecrets: Record<string, boolean>;
  toggleSecret: (key: string) => void;
  copiedId: string | null;
  handleCopy: (text: string, id: string) => Promise<void>;
  getStatusBadgeClass: (status: string) => string;
  getStatusText: (status: string) => string;
}

function ProductCard({
  product,
  onEdit,
  onDelete,
  showSecrets,
  toggleSecret,
  copiedId,
  handleCopy,
  getStatusBadgeClass,
  getStatusText,
}: ProductCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "docs">("accounts");

  return (
    <div className="bg-bg-surface border border-border rounded-[12px] p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Left Side: Product Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-text-primary">{product.name}</h3>
            <span className={cn("px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider", getStatusBadgeClass(product.status))}>
              {getStatusText(product.status)}
            </span>
            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-bg-elevated border border-border text-text-secondary">
              v{product.version}
            </span>
            {product.techStack && (
              <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-blue-500/5 text-blue-500 border border-blue-500/10">
                {product.techStack}
              </span>
            )}
          </div>

          <p className="text-sm text-text-secondary line-clamp-3">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>

          {/* Links block */}
          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-bg-elevated border border-border hover:bg-bg-surface text-text-primary font-medium transition-colors"
              >
                <Globe size={13} className="text-accent" />
                <span>Trực tiếp (Production)</span>
                <ExternalLink size={11} className="text-text-muted" />
              </a>
            )}

            {product.repoUrl && (
              <a
                href={product.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-bg-elevated border border-border hover:bg-bg-surface text-text-primary font-medium transition-colors"
              >
                <GitBranch size={13} className="text-emerald-500" />
                <span>Repository Git</span>
                <ExternalLink size={11} className="text-text-muted" />
              </a>
            )}

            {product.docsUrl && (
              <a
                href={product.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-bg-elevated border border-border hover:bg-bg-surface text-text-primary font-medium transition-colors"
              >
                <BookOpen size={13} className="text-amber-500" />
                <span>Tài liệu Kỹ thuật</span>
                <ExternalLink size={11} className="text-text-muted" />
              </a>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action buttons */}
        <div className="flex lg:flex-col gap-2 shrink-0 justify-end lg:justify-start">
          <button
            onClick={onEdit}
            className="p-2 rounded-[6px] bg-bg-elevated border border-border text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold px-3"
            title="Chỉnh sửa sản phẩm"
          >
            <Edit3 size={14} />
            <span>Sửa</span>
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-[6px] bg-bg-elevated border border-border text-text-muted hover:text-danger hover:bg-danger/10 hover:border-danger/20 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold px-3"
            title="Xóa sản phẩm"
          >
            <Trash2 size={14} />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Tabs & Tab Details: Demo Accounts & Docs */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => setActiveSubTab("accounts")}
            className={cn(
              "pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all",
              activeSubTab === "accounts"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            Tài khoản Demo ({product.demoAccounts?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab("docs")}
            className={cn(
              "pb-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all",
              activeSubTab === "docs"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            Tài liệu & Tài nguyên Demo ({product.demoDocs?.length || 0})
          </button>
        </div>

        {/* Tab contents */}
        {activeSubTab === "accounts" ? (
          !product.demoAccounts || product.demoAccounts.length === 0 ? (
            <p className="text-xs text-text-muted italic py-2">Chưa thiết lập tài khoản đăng nhập demo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.demoAccounts.map((acc, idx) => {
                const key = `${product.id}-${idx}`;
                const showSec = showSecrets[key];
                return (
                  <div key={idx} className="p-3.5 rounded-[8px] bg-bg-elevated/40 border border-border/80 space-y-2 relative group/item">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Shield size={12} className="text-accent" />
                        {acc.role || "Tài khoản Demo"}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center bg-bg-elevated/60 px-2.5 py-1.5 rounded-[6px] border border-border/30">
                        <span className="text-text-muted select-none">Tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-text-primary select-all">{acc.username}</span>
                          <button
                            onClick={() => handleCopy(acc.username || "", `${key}-user`)}
                            className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                          >
                            {copiedId === `${key}-user` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-bg-elevated/60 px-2.5 py-1.5 rounded-[6px] border border-border/30">
                        <span className="text-text-muted select-none">Mật khẩu:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-text-primary select-all">
                            {showSec ? acc.password : "••••••••"}
                          </span>
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => toggleSecret(key)}
                              className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                              {showSec ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              onClick={() => handleCopy(acc.password || "", `${key}-pass`)}
                              className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                            >
                              {copiedId === `${key}-pass` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {acc.notes && (
                      <p className="text-[11px] text-text-muted italic border-t border-border/20 pt-1.5 mt-1.5">
                        * Ghi chú: {acc.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          !product.demoDocs || product.demoDocs.length === 0 ? (
            <p className="text-xs text-text-muted italic py-2">Chưa đính kèm tài liệu demo nào.</p>
          ) : (
            <div className="space-y-2.5">
              {product.demoDocs.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-[8px] bg-bg-elevated/30 border border-border/60 hover:bg-bg-elevated/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-text-primary block">{doc.name || "Tài liệu Demo"}</span>
                    {doc.description && <span className="text-[11px] text-text-muted block line-clamp-1">{doc.description}</span>}
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-bg-surface hover:bg-bg-elevated text-xs font-semibold border border-border transition-colors text-accent shrink-0 ml-4"
                  >
                    <span>Xem tài liệu</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── Product Form Modal Component ─────────────────────────────────────

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [status, setStatus] = useState(product?.status || "Active");
  const [version, setVersion] = useState(product?.version || "1.0.0");
  const [url, setUrl] = useState(product?.url || "");
  const [repoUrl, setRepoUrl] = useState(product?.repoUrl || "");
  const [techStack, setTechStack] = useState(product?.techStack || "");
  const [docsUrl, setDocsUrl] = useState(product?.docsUrl || "");

  // Demo accounts array state
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>(
    product?.demoAccounts ? [...product.demoAccounts] : []
  );

  // Demo docs array state
  const [demoDocs, setDemoDocs] = useState<DemoDoc[]>(
    product?.demoDocs ? [...product.demoDocs] : []
  );

  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleAddAccount = () => {
    setDemoAccounts((prev) => [...prev, { role: "", username: "", password: "", notes: "" }]);
  };

  const handleRemoveAccount = (index: number) => {
    setDemoAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAccountChange = (index: number, field: keyof DemoAccount, val: string) => {
    setDemoAccounts((prev) =>
      prev.map((acc, i) => (i === index ? { ...acc, [field]: val } : acc))
    );
  };

  const handleAddDoc = () => {
    setDemoDocs((prev) => [...prev, { name: "", url: "", description: "" }]);
  };

  const handleRemoveDoc = (index: number) => {
    setDemoDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocChange = (index: number, field: keyof DemoDoc, val: string) => {
    setDemoDocs((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: val } : doc))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name,
        description,
        status,
        version,
        url: url.trim() || null,
        repoUrl: repoUrl.trim() || null,
        techStack: techStack.trim() || null,
        docsUrl: docsUrl.trim() || null,
        demoAccounts,
        demoDocs,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-[12px] bg-bg-surface border border-border shadow-2xl animate-fade-in-scale max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-bg-surface z-10">
          <h3 className="text-lg font-bold text-text-primary">
            {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-[6px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* General inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Tên sản phẩm / Ứng dụng *"
                placeholder="Ví dụ: FlowDesk, OKR Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="text-sm font-medium text-text-primary block mb-1.5">Mô tả sản phẩm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả tóm tắt về vai trò và chức năng của phần mềm..."
                className="w-full h-20 rounded-[8px] p-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-[8px] px-3 text-sm bg-bg-elevated text-text-primary border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Active">Hoạt động (Active)</option>
                <option value="Beta">Thử nghiệm (Beta)</option>
                <option value="Maintenance">Bảo trì (Maintenance)</option>
                <option value="Dev">Đang phát triển (Dev)</option>
              </select>
            </div>

            <Input
              label="Phiên bản (Version)"
              placeholder="Ví dụ: 1.0.2"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />

            <div className="col-span-2">
              <Input
                label="Công nghệ sử dụng (Tech Stack)"
                placeholder="Ví dụ: Next.js, FastAPI, Prisma, TailwindCSS"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>

            <Input
              label="Đường dẫn Web (Production URL)"
              placeholder="https://app.yourdomain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />

            <Input
              label="Mã nguồn (Git Repo URL)"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              type="url"
            />

            <div className="col-span-2">
              <Input
                label="Tài liệu kỹ thuật (Docs URL)"
                placeholder="https://docs.yourdomain.com"
                value={docsUrl}
                onChange={(e) => setDocsUrl(e.target.value)}
                type="url"
              />
            </div>
          </div>

          {/* ── Demo Accounts Section ── */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Key size={14} className="text-indigo-500" />
                Tài khoản đăng nhập Demo ({demoAccounts.length})
              </span>
              <Button type="button" variant="secondary" size="sm" iconLeft={<Plus size={14} />} onClick={handleAddAccount}>
                Thêm tài khoản
              </Button>
            </div>

            {demoAccounts.length > 0 && (
              <div className="space-y-3">
                {demoAccounts.map((acc, idx) => (
                  <div key={idx} className="p-3 bg-bg-elevated/40 border border-border rounded-[8px] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(idx)}
                      className="absolute top-2.5 right-2.5 text-text-muted hover:text-danger p-1 rounded hover:bg-bg-elevated transition-colors cursor-pointer"
                      title="Xóa tài khoản này"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                      <Input
                        label="Vai trò / Quyền"
                        placeholder="Ví dụ: Admin, Khách"
                        value={acc.role || ""}
                        onChange={(e) => handleAccountChange(idx, "role", e.target.value)}
                      />
                      <Input
                        label="Tên đăng nhập / Email"
                        placeholder="demo@domain.com"
                        value={acc.username || ""}
                        onChange={(e) => handleAccountChange(idx, "username", e.target.value)}
                        required
                      />
                      <Input
                        label="Mật khẩu"
                        placeholder="Mật khẩu demo"
                        value={acc.password || ""}
                        onChange={(e) => handleAccountChange(idx, "password", e.target.value)}
                        required
                      />
                    </div>
                    <div className="pt-0.5">
                      <Input
                        label="Ghi chú thêm"
                        placeholder="Ví dụ: Tài khoản bị giới hạn chức năng thanh toán"
                        value={acc.notes || ""}
                        onChange={(e) => handleAccountChange(idx, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Demo Documents Section ── */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-500" />
                Tài liệu & Tài nguyên Demo ({demoDocs.length})
              </span>
              <Button type="button" variant="secondary" size="sm" iconLeft={<Plus size={14} />} onClick={handleAddDoc}>
                Thêm tài liệu
              </Button>
            </div>

            {demoDocs.length > 0 && (
              <div className="space-y-3">
                {demoDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-bg-elevated/40 border border-border rounded-[8px] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="absolute top-2.5 right-2.5 text-text-muted hover:text-danger p-1 rounded hover:bg-bg-elevated transition-colors cursor-pointer"
                      title="Xóa tài liệu này"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      <Input
                        label="Tên tài liệu / Tài nguyên"
                        placeholder="Ví dụ: File kịch bản Test, Hướng dẫn sử dụng"
                        value={doc.name || ""}
                        onChange={(e) => handleDocChange(idx, "name", e.target.value)}
                        required
                      />
                      <Input
                        label="Đường dẫn tài liệu (Link)"
                        placeholder="https://drive.google.com/..."
                        value={doc.url || ""}
                        onChange={(e) => handleDocChange(idx, "url", e.target.value)}
                        type="url"
                        required
                      />
                    </div>
                    <div className="pt-0.5">
                      <Input
                        label="Mô tả tài liệu"
                        placeholder="Ví dụ: Chứa luồng kiểm thử chức năng thanh toán"
                        value={doc.description || ""}
                        onChange={(e) => handleDocChange(idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" loading={saving} disabled={!name.trim()}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
}
