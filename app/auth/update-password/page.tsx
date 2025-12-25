import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import UpdatePasswordClient from "./UpdatePasswordClient";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UpdatePasswordPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  return <UpdatePasswordClient />;
}
