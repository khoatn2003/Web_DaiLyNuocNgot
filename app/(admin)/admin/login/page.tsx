"use client";

import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
   // tạo client 1 lần (tránh tạo lại mỗi render)
  const supabase = useMemo(() => createSupabaseBrowser(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length >= 6 && !loading;
  }, [email, password, loading]);


  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMsg("Sai email hoặc mật khẩu. Vui lòng thử lại.");
        return;
      }

      // ✅ chốt lại user/session trước khi điều hướng
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMsg("Đăng nhập chưa ổn định, vui lòng thử lại.");
        return;
      }

      router.replace("/admin"); // replace để không back về login
      // KHÔNG cần router.refresh ở đây
    } catch {
      setMsg("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
     {loading && (
      <div
        className="fixed inset-0 z-[999] grid place-items-center bg-white/70 backdrop-blur-sm"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/80 px-6 py-5 shadow-xl ring-1 ring-black/5">
          <Loader2 className="h-10 w-10 animate-spin text-[#0213b0]" />
          <div className="text-sm font-medium text-slate-700">
            Đang đăng nhập...
          </div>
          <div className="text-xs text-slate-500">
            Vui lòng chờ trong giây lát
          </div>
        </div>
      </div>
    )}
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand / heading */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0213b0] text-white shadow">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Đăng nhập quản trị
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Khu vực dành cho quản trị viên hệ thống.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6">
          <form onSubmit={onLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Email
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  className="w-full rounded-xl bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/40"
                  placeholder="dailynuocngottienmao@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-800">
                Mật khẩu
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>

                <input
                  className="w-full rounded-xl bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/40"
                  placeholder="••••••••" 
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-black/5"
                  aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                Mật khẩu tối thiểu 6 ký tự.
              </div>
            </div>

            {/* Error */}
            {msg && (
              <div className="rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2 ring-1 ring-red-100">
                {msg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-[#0213b0] text-white py-3 font-semibold shadow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>

            {/* Back link */}
            <div className="pt-2 text-center text-sm text-slate-600">
              <Link href="/" className="hover:underline underline-offset-4">
                ← Về trang chủ
              </Link>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Nếu bạn không phải quản trị viên, vui lòng quay lại trang chủ.
        </p>
      </div>
    </main>
    </>
  );
}
