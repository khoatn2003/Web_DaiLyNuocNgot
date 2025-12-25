"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

type Profile = {
  full_name: string;
  phone: string;
  address: string;
};

export default function AccountClient({
  userId,
  email,
  isAdmin,
  createdAt,
  initialProfile,
}: {
  userId: string;
  email: string;
  isAdmin: boolean;
  createdAt: string | null;
  initialProfile: Profile;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowser(), []);

  const [profile, setProfile] = useState<Profile>(initialProfile);

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null
  );

  function toast(type: "success" | "error" | "info", text: string) {
    setMsg({ type, text });
    // auto clear nhẹ
    window.clearTimeout((toast as any)._t);
    (toast as any)._t = window.setTimeout(() => setMsg(null), 3500);
  }

  async function saveProfile() {
  setBusy(true);
  setMsg(null);

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name.trim() || null,
        phone: profile.phone.trim() || null,
        address: profile.address.trim() || null,
      })
      .eq("id", userId);

    if (error) throw error;

    toast("success", "Đã lưu thông tin cá nhân.");
    router.refresh();
  } catch (e: any) {
    toast("error", e?.message ?? "Không lưu được thông tin.");
  } finally {
    setBusy(false);
  }
}


    const [oldPw, setOldPw] = useState("");
    const [showOldPw, setShowOldPw] = useState(false);

    async function changePassword() {
    setMsg(null);

    if (!oldPw) return toast("info", "Vui lòng nhập mật khẩu cũ.");
    if (pw1.length < 6) return toast("info", "Mật khẩu mới tối thiểu 6 ký tự.");
    if (pw1 !== pw2) return toast("info", "Mật khẩu nhập lại không khớp.");
    if (oldPw === pw1) return toast("info", "Mật khẩu mới phải khác mật khẩu cũ.");

    setBusy(true);
    try {
        // 1) Re-auth bằng mật khẩu cũ (sai là dừng)
        const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email,
        password: oldPw,
        });
        if (reauthErr) {
        toast("error", "Mật khẩu cũ không đúng.");
        return;
        }

        // 2) Đổi mật khẩu
        const { error } = await supabase.auth.updateUser({ password: pw1 });
        if (error) throw error;

        setOldPw("");
        setPw1("");
        setPw2("");
        toast("success", "Đã đổi mật khẩu.");
    } catch (e: any) {
        toast("error", e?.message ?? "Không đổi được mật khẩu.");
    } finally {
        setBusy(false);
    }
    }

  async function logout() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const badge =
    isAdmin ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 px-3 py-1 text-xs font-semibold">
        <ShieldCheck size={14} />
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 text-slate-700 px-3 py-1 text-xs font-semibold">
        <User size={14} />
        Khách hàng
      </span>
    );

  const alert =
    msg?.type === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
      : msg?.type === "error"
      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
      : "bg-amber-50 text-amber-800 ring-1 ring-amber-100";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Topbar */}
      <div className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0213b0] text-white shadow">
            <User size={18} />
          </div>

          <div className="min-w-0">
            <div className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
              Trang cá nhân
            </div>
            <div className="text-xs text-slate-500 truncate">
              Quản lý thông tin & bảo mật tài khoản
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {badge}

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-black/5"
                title="Quay lại trang quản trị"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Về Admin</span>
              </Link>
            )}

            <button
              onClick={logout}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
              title="Đăng xuất"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {msg && <div className={`rounded-2xl px-4 py-3 text-sm ${alert}`}>{msg.text}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile card */}
          <section className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-slate-900">Thông tin cá nhân</div>
                {!isAdmin && (
                <div className="text-sm text-slate-500 mt-1">
                  Cập nhật thông tin để tiện liên hệ và giao hàng.
                </div>
                )}
              </div>

              <button
                onClick={saveProfile}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0213b0] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 disabled:opacity-60"
              >
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Lưu
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Email display */}
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Mail size={16} />
                  Email đăng nhập
                </div>
                <div className="mt-1 text-sm text-slate-600 break-words">{email}</div>
                {createdAt && (
                  <div className="mt-2 text-xs text-slate-500">
                    Tạo lúc: {new Date(createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Full name */}
              <div>
                <label className="text-sm font-medium text-slate-800">Họ & tên</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    className="w-full rounded-xl bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-slate-800">Số điện thoại</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={18} />
                  </span>
                  <input
                    className="w-full rounded-xl bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                    placeholder="Ví dụ: 09xxxxxxxx"
                    inputMode="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-slate-800">Địa chỉ</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <MapPin size={18} />
                  </span>
                  <textarea
                    className="w-full min-h-[110px] rounded-xl bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Mẹo: Bạn có thể để trống số điện thoại/địa chỉ nếu chưa cần.
              </div>
            </div>
          </section>

          {/* Security card */}
          <section className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-5">
            <div>
              <div className="text-lg font-bold text-slate-900">Bảo mật</div>
              <div className="text-sm text-slate-500 mt-1">
                Đổi mật khẩu để tăng an toàn cho tài khoản.
              </div>
            </div>
            <div>
            <label className="text-sm font-medium text-slate-800">Mật khẩu cũ</label>
            <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound size={18} />
                </span>

                <input
                className="w-full rounded-xl bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                placeholder="••••••••"
                type={showOldPw ? "text" : "password"}
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                autoComplete="current-password"
                />

                <button
                type="button"
                onClick={() => setShowOldPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-black/5"
                aria-label={showOldPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                {showOldPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                    type={showPw1 ? "text" : "password"}
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw1((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-black/5"
                    aria-label={showPw1 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPw1 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800">Nhập lại mật khẩu mới</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound size={18} />
                  </span>
                  <input
                    className="w-full rounded-xl bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0213b0]/30"
                    placeholder="••••••••"
                    type={showPw2 ? "text" : "password"}
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-black/5"
                    aria-label={showPw2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-500">Mật khẩu tối thiểu 6 ký tự.</div>
              </div>

              <button
                onClick={changePassword}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-black/5 disabled:opacity-60"
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Đổi mật khẩu
              </button>

              <div className="text-xs text-slate-500">
                Nếu bạn quên mật khẩu, dùng tính năng “Quên mật khẩu” ở trang đăng nhập. 
              </div>
            </div>
          </section>
        </div>

        {/* Footer back */}
        {!isAdmin && (
        <div className="text-center text-xs text-slate-500">
          <Link href="/" className="hover:underline underline-offset-4">
            ← Về trang chủ
          </Link>
        </div>
        )}
      </div>

      {/* Fullscreen busy overlay (nhẹ, hiện đại) */}
      {busy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/10 backdrop-blur-[1px]">
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 px-4 py-3 flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            <div className="text-sm font-medium text-slate-800">Đang xử lý…</div>
          </div>
        </div>
      )}
    </main>
  );
}
