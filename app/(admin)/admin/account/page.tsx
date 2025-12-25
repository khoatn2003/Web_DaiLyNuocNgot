import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import AccountClient from "@/components/AccountClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address, is_admin, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AccountClient
      userId={user.id}
      email={user.email ?? ""}
      isAdmin={!!profile?.is_admin}
      createdAt={profile?.created_at ?? null}
      initialProfile={{
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        address: profile?.address ?? "",
      }}
    />
  );
}
