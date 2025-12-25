"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

export default function AdminForgotPage() {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    try {
      const origin = window.location.origin;

      // Quan trọng: redirectTo nên trỏ về /auth/callback để exchange code -> set cookie SSR
      const redirectTo = `${origin}/auth/callback?next=/account/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      // Best practice: luôn báo chung chung để tránh dò email tồn tại hay không
      if (error) {
        setMsg("Nếu email hợp lệ, hệ thống sẽ gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");
        return;
      }

      setMsg("Nếu email hợp lệ, hệ thống đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0213b0] text-white shadow">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Quên mật khẩu
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Nhập email để nhận link đặt lại mật khẩu.
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Email
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-xl bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/40"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </div>
            </div>

            {msg && (
              <div className="rounded-xl bg-slate-50 text-slate-700 text-sm px-3 py-2 ring-1 ring-slate-100">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || email.trim().length === 0}
              className="w-full rounded-xl bg-[#0213b0] text-white py-3 font-semibold shadow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {busy ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Đang gửi...
                </span>
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </button>

            <div className="pt-2 text-center text-sm text-slate-600">
              <Link href="/admin/login" className="hover:underline underline-offset-4">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
