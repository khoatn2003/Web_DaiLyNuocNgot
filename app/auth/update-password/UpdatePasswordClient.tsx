"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpdatePasswordClient() {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const router = useRouter();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onChange() {
    setMsg(null);
    if (pw1.length < 6) return setMsg("Mật khẩu tối thiểu 6 ký tự.");
    if (pw1 !== pw2) return setMsg("Mật khẩu nhập lại không khớp.");

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;

      setPw1("");
      setPw2("");
      setMsg("Đã cập nhật mật khẩu. Bạn có thể tiếp tục sử dụng tài khoản.");
      router.replace("/account");
      router.refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Không đổi được mật khẩu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0213b0] text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">Đặt mật khẩu mới</div>
            <div className="text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản.</div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-800">Mật khẩu mới</label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound size={18} />
              </span>
              <input
                className="w-full rounded-xl bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                placeholder="••••••••"
                type={show1 ? "text" : "password"}
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow1((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-black/5"
                aria-label={show1 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Nhập lại mật khẩu</label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound size={18} />
              </span>
              <input
                className="w-full rounded-xl bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                placeholder="••••••••"
                type={show2 ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow2((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-black/5"
                aria-label={show2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500">Mật khẩu tối thiểu 6 ký tự.</div>
          </div>

          {msg && (
            <div className="rounded-xl bg-slate-50 text-slate-700 text-sm px-3 py-2 ring-1 ring-slate-100">
              {msg}
            </div>
          )}

          <button
            onClick={onChange}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0213b0] text-white px-4 py-3 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            Cập nhật mật khẩu
          </button>
        </div>
      </div>
    </main>
  );
}
