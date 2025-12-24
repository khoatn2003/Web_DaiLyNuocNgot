"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function RealtimeRefresh() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refreshSoon = () => {
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => router.refresh(), 200);
    };

    const channel = supabase
      .channel("site-realtime") // đổi tên chung
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, refreshSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_images" }, refreshSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, refreshSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "brands" }, refreshSoon)
      .subscribe();

    return () => {
      if (t.current) clearTimeout(t.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null;
}
