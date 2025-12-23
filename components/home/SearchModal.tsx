"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

const RECENT_KEY = "recent_searches_v1";

export default function SearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);

  // dùng để animate open/close mượt
  const [show, setShow] = useState(false);
  const [enter, setEnter] = useState(false);

  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const trending = useMemo(
    () => ["Bia Camel", "Bia Hà Nội", "Sữa Milo", "Sữa TH True", "Nước suối Aquafina"],
    []
  );

  useEffect(() => setMounted(true), []);

  // open/close animation (không dùng style jsx, không dùng animate-[...])
  useEffect(() => {
    if (open) {
      setShow(true);
      requestAnimationFrame(() => setEnter(true));
    } else {
      setEnter(false);
      const t = window.setTimeout(() => setShow(false), 200);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // load recent khi mở
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setRecent(Array.isArray(arr) ? arr.slice(0, 8) : []);
    } catch {
      setRecent([]);
    }
  }, [open]);

  // lock scroll + focus + esc close
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => inputRef.current?.focus(), 50);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const saveRecent = (text: string) => {
    const v = text.trim();
    if (!v) return;
    const next = [v, ...recent.filter((x) => x !== v)].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const goSearch = (text: string) => {
    const v = text.trim();
    if (!v) return;
    saveRecent(v);
    onClose();
    router.push(`/san-pham?search=${encodeURIComponent(v)}`);
  };

  // SSR safe
  if (!mounted || !show || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[999]">
      {/* Backdrop (fade) */}
      <button
        type="button"
        aria-label="Đóng tìm kiếm"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          enter ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Panel (slide) */}
      <div
        role="dialog"
        aria-modal="true"
        className={[
          "absolute right-0 top-0 h-full w-full max-w-[460px] bg-[#fbf7ea] shadow-2xl",
          "transition-transform duration-200 ease-out",
          enter ? "translate-x-0" : "translate-x-6",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0b2bbf]/15">
          <div className="font-extrabold text-[#0b2bbf]">Tìm kiếm</div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-[#0b2bbf] hover:underline underline-offset-4"
          >
            Đóng
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goSearch(q);
            }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 border-b-2 border-[#0b2bbf]/40 focus-within:border-[#0b2bbf]">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm sản phẩm…"
                className="w-full bg-transparent py-3 text-sm outline-none text-[#0b2bbf] placeholder:text-[#0b2bbf]/50"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#0b2bbf] text-white px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              Tìm
            </button>
          </form>
        </div>

        <div className="px-5 py-4 space-y-6 overflow-auto h-[calc(100%-120px)]">
          {/* Recent */}
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-[#0b2bbf]">Tìm gần đây</div>
              {recent.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRecent([]);
                    try {
                      localStorage.removeItem(RECENT_KEY);
                    } catch {}
                  }}
                  className="text-xs font-semibold text-[#0b2bbf]/70 hover:underline underline-offset-4"
                >
                  Xoá
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {recent.length === 0 ? (
                <div className="text-sm text-[#0b2bbf]/60">Chưa có tìm kiếm.</div>
              ) : (
                recent.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => goSearch(x)}
                    className="rounded-full border border-[#0b2bbf]/25 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#0b2bbf] hover:bg-white"
                  >
                    {x}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Trending */}
          <div className="border-t border-[#0b2bbf]/15 pt-4">
            <div className="text-sm font-extrabold text-[#0b2bbf]">Xu hướng</div>
            <div className="mt-3 space-y-2">
              {trending.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => goSearch(t)}
                  className="block w-full text-left text-sm font-semibold text-[#0b2bbf] hover:underline underline-offset-4"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Gợi ý (demo) */}
          <div className="border-t border-[#0b2bbf]/15 pt-4">
            <div className="text-sm font-extrabold text-[#0b2bbf]">Dành cho bạn</div>
            <div className="mt-3 space-y-3">
              {["Coca-Cola lon", "Pepsi lon", "Aquafina 500ml", "Sting dâu"].map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => goSearch(x)}
                  className="w-full text-left rounded-xl bg-white/70 border border-[#0b2bbf]/10 px-3 py-2 hover:bg-white"
                >
                  <div className="text-sm font-extrabold text-[#0b2bbf]">{x}</div>
                  <div className="text-xs text-[#0b2bbf]/65">Bấm để tìm nhanh</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
