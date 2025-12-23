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

  const upsertCategory = useCallback(
    async (c: Partial<Category>) => {
      const name = (c.name ?? "").trim();
      const slug = (c.slug ?? "").trim();
      if (!name || !slug) return notify("Thiếu name/slug", "info");

      const abbr = (c.abbr ?? "").trim().toUpperCase().slice(0, 2);

      const { error } = await supabase
        .from("categories")
        .upsert([{ name, slug, abbr: abbr ? abbr : null }], { onConflict: "slug" });

      if (error) return notify(toUserMessage(error), "error");

      notify("Đã lưu danh mục", "success");
      await loadMeta();
    },
    [supabase, notify, loadMeta]
  );

  const upsertBrand = useCallback(
    async (b: Partial<Brand>) => {
      const name = (b.name ?? "").trim();
      const slug = (b.slug ?? "").trim();
      if (!name || !slug) return notify("Thiếu name/slug", "info");

      const abbr = (b.abbr ?? "").trim().toUpperCase().slice(0, 2);

      const { error } = await supabase
        .from("brands")
        .upsert([{ name, slug, abbr: abbr ? abbr : null }], { onConflict: "slug" });

      if (error) return notify(toUserMessage(error), "error");

      notify("Đã lưu hãng", "success");
      await loadMeta();
    },
    [supabase, notify, loadMeta]
  );

  return { cats, brs, loadMeta, upsertCategory, upsertBrand };
}
