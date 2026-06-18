'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UI } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Email hoặc mật khẩu không đúng');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* ── Background ────────────────────────────────────── */}
      <div className="absolute inset-0 bg-bg-base" />
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 pattern-dots" />

      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      {/* ── Login Card ────────────────────────────────────── */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-[16px] p-8 shadow-2xl shadow-black/30 border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-[12px] gradient-accent flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-blue-500/25">
              F
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Nhập mật khẩu truy cập
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Nhập mật khẩu để bắt đầu làm việc với FlowDesk
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              autoFocus
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full h-11 text-sm font-semibold"
            >
              {UI.login}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-text-muted">
          {UI.appName} — {UI.appTagline}
        </p>
      </div>
    </div>
  );
}
