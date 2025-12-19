import { useCallback, useState } from "react";
import type { Category, Brand } from "../type";

export function useMeta(supabase: any, setToast: (s: string) => void) {
  const [cats, setCats] = useState<Category[]>([]);
  const [brs, setBrs] = useState<Brand[]>([]);

  const loadMeta = useCallback(async () => {
    const [cRes, bRes] = await Promise.all([
      supabase.from("categories").select("id,name,slug,abbr").order("name"),
      supabase.from("brands").select("id,name,slug,abbr").order("name"),
    ]);

    if (cRes.error) setToast(cRes.error.message);
    if (bRes.error) setToast(bRes.error.message);

    setCats((cRes.data ?? []) as Category[]);
    setBrs((bRes.data ?? []) as Brand[]);
  }, [supabase, setToast]);

  const upsertCategory = useCallback(
    async (c: Partial<Category>) => {
      const name = (c.name ?? "").trim();
      const slug = (c.slug ?? "").trim();
      if (!name || !slug) return setToast("Thiếu name/slug");

      const abbr = (c.abbr ?? "").trim().toUpperCase().slice(0, 2);

      // upsert dạng mảng để tránh lỗi overload TS
      const { error } = await supabase
        .from("categories")
        .upsert([{ name, slug, abbr: abbr ? abbr : null }], { onConflict: "slug" });

      if (error) return setToast(error.message);
      setToast("Đã lưu danh mục");
      await loadMeta();
    },
    [supabase, setToast, loadMeta]
  );

  const upsertBrand = useCallback(
    async (b: Partial<Brand>) => {
      const name = (b.name ?? "").trim();
      const slug = (b.slug ?? "").trim();
      if (!name || !slug) return setToast("Thiếu name/slug");

      const abbr = (b.abbr ?? "").trim().toUpperCase().slice(0, 2);

      const { error } = await supabase
        .from("brands")
        .upsert([{ name, slug, abbr: abbr ? abbr : null }], { onConflict: "slug" });

      if (error) return setToast(error.message);
      setToast("Đã lưu hãng");
      await loadMeta();
    },
    [supabase, setToast, loadMeta]
  );

  return { cats, brs, loadMeta, upsertCategory, upsertBrand };
}
