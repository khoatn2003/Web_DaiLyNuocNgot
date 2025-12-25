import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import AdminClient from "./quanly/AdminClient";

export default async function AdminPage() {
  const supabase = await createSupabaseServer();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return (
      <main className="min-h-screen p-6 bg-zinc-950 text-zinc-100">
        <div className="max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-xl font-semibold">Không có quyền truy cập</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Tài khoản này không phải admin .
          </p>
        </div>
      </main>
    );
  }

  return <AdminClient name={profile.full_name ?? ""} email={user.email ?? ""} />;
}
