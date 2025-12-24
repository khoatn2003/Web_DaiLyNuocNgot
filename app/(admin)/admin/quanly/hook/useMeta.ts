import { useCallback, useState } from "react";
import type { Category, Brand, Notify } from "../type";
import { toUserMessage } from "../lib/errorMessage";

export function useMeta(supabase: any, notify: Notify) {
  const [cats, setCats] = useState<Category[]>([]);
  const [brs, setBrs] = useState<Brand[]>([]);

  const loadMeta = useCallback(async () => {
    const [cRes, bRes] = await Promise.all([
      supabase.from("categories").select("id,name,slug,abbr").order("name"),
      supabase.from("brands").select("id,name,slug,abbr").order("name"),
    ]);

    if (cRes.error) notify(toUserMessage(cRes.error), "error");
    if (bRes.error) notify(toUserMessage(bRes.error), "error");

    setCats((cRes.data ?? []) as Category[]);
    setBrs((bRes.data ?? []) as Brand[]);
  }, [supabase, notify]);

  const saveCategory = useCallback(
    async (c: Partial<Category>): Promise<boolean> => {
      const id = c.id ?? null;
      const name = (c.name ?? "").trim();
      const slug = (c.slug ?? "").trim();
      if (!name || !slug) {
        notify("Thiếu name/slug", "info");
        return false;
      }

      const abbr = (c.abbr ?? "").trim().toUpperCase().slice(0, 2);
      const data = { name, slug, abbr: abbr ? abbr : null };

      const res = id
        ? await supabase.from("categories").update(data).eq("id", id)
        : await supabase.from("categories").insert(data);

      if (res.error) {
        notify(toUserMessage(res.error), "error");
        return false;
      }

      notify(id ? "Đã cập nhật ngành hàng" : "Đã thêm ngành hàng", "success");
      await loadMeta();
      return true;
    },
    [supabase, notify, loadMeta]
  );

  const saveBrand = useCallback(
    async (b: Partial<Brand>): Promise<boolean> => {
      const id = b.id ?? null;
      const name = (b.name ?? "").trim();
      const slug = (b.slug ?? "").trim();
      if (!name || !slug) {
        notify("Thiếu name/slug", "info");
        return false;
      }

      const abbr = (b.abbr ?? "").trim().toUpperCase().slice(0, 2);
      const data = { name, slug, abbr: abbr ? abbr : null };

      const res = id
        ? await supabase.from("brands").update(data).eq("id", id)
        : await supabase.from("brands").insert(data);

      if (res.error) {
        notify(toUserMessage(res.error), "error");
        return false;
      }

      notify(id ? "Đã cập nhật thương hiệu" : "Đã thêm thương hiệu", "success");
      await loadMeta();
      return true;
    },
    [supabase, notify, loadMeta]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        notify(toUserMessage(error), "error"); // nếu bị FK constraint sẽ báo ở đây
        return false;
      }
      notify("Đã xóa ngành hàng", "success");
      await loadMeta();
      return true;
    },
    [supabase, notify, loadMeta]
  );

  const deleteBrand = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) {
        notify(toUserMessage(error), "error");
        return false;
      }
      notify("Đã xóa thương hiệu", "success");
      await loadMeta();
      return true;
    },
    [supabase, notify, loadMeta]
  );

  return { cats, brs, loadMeta, saveCategory, saveBrand, deleteCategory, deleteBrand };
}
