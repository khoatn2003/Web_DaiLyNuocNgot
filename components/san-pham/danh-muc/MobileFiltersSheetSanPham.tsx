"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type Opt = { id: string; name: string; slug: string };

function buildHref(
  base: string,
  current: Record<string, string>,
  patch: Record<string, string | null>
) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) if (v) usp.set(k, v);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") usp.delete(k);
    else usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

export default function MobileFiltersSheet({
  basePath,
  current,
  allCats,
  brands,
  volOptions,
  defaultSort = "moi-nhat",
}: {
  basePath: string;
  current: Record<string, string>;
  allCats: Opt[];
  brands: Opt[];
  volOptions: string[];
  defaultSort?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // local selections (chọn xong mới apply)
  const [selSort, setSelSort] = useState(current.sort || defaultSort);
  const [selCat, setSelCat] = useState<string | null>(current.cat || null);
  const [selBrand, setSelBrand] = useState<string | null>(current.brand || null);
  const [selVol, setSelVol] = useState<string | null>(current.vol || null);

  useEffect(() => setMounted(true), []);

  // lock scroll + ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // sync local state when open
  useEffect(() => {
    if (!open) return;
    setSelSort(current.sort || defaultSort);
    setSelCat(current.cat || null);
    setSelBrand(current.brand || null);
    setSelVol(current.vol || null);
  }, [open, current, defaultSort]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (current.cat) n++;
    if (current.brand) n++;
    if (current.vol) n++;
    if (current.sort && current.sort !== defaultSort) n++;
    return n;
  }, [current, defaultSort]);

  const apply = () => {
    const href = buildHref(basePath, current, {
      sort: selSort || null,
      cat: selCat,
      brand: selBrand,
      vol: selVol,
      page: "1",
    });
    setOpen(false);
    router.push(href);
  };

  const clearAll = () => {
    const href = buildHref(basePath, current, {
      sort: null,
      cat: null,
      brand: null,
      vol: null,
      page: "1",
    });
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Trigger (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[#0b2bbf]/25 bg-white/60 px-4 py-2 text-sm font-extrabold text-[#0b2bbf] hover:bg-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Bộ lọc
        {activeCount > 0 ? (
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0b2bbf] px-1.5 text-[11px] font-extrabold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {/* Bottom sheet modal */}
      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[9999]">
              {/* overlay */}
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
              />

              {/* sheet */}
              <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#fffff2] text-[#0b2bbf] shadow-2xl ring-1 ring-black/10 max-h-[80vh] overflow-auto">
                {/* header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#0b2bbf]/15">
                  <div className="text-lg font-extrabold">Lọc và sắp xếp</div>
                  <button
                    type="button"
                    className="rounded-xl p-2 hover:bg-[#0b2bbf]/10"
                    onClick={() => setOpen(false)}
                    aria-label="Đóng"
                    title="Đóng"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-5 py-3">
                  {/* Sort */}
                  <details className="border-b border-[#0b2bbf]/15 py-2" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                      <span>Xếp theo</span>
                      <span className="opacity-70">▾</span>
                    </summary>
                    <div className="pt-2">
                      <select
                        value={selSort}
                        onChange={(e) => setSelSort(e.target.value)}
                        className="w-full rounded-xl border border-[#0b2bbf]/20 bg-white px-3 py-2 text-sm font-semibold outline-none"
                      >
                        <option value="lien-quan">Liên quan</option>
                        <option value="moi-nhat">Mới nhất</option>
                        <option value="gia-tang">Giá tăng</option>
                        <option value="gia-giam">Giá giảm</option>
                      </select>
                    </div>
                  </details>

                  {/* Danh mục */}
                  <details className="border-b border-[#0b2bbf]/15 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                      <span>Danh mục</span>
                      <span className="opacity-70">▾</span>
                    </summary>

                    <div className="pt-2 space-y-2">
                      <label className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/60 hover:bg-white">
                        <span className="text-sm font-semibold">Tất cả</span>
                        <input
                          type="radio"
                          name="cat"
                          checked={selCat === null}
                          onChange={() => setSelCat(null)}
                        />
                      </label>

                      {allCats.map((c) => (
                        <label
                          key={c.id}
                          className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/60 hover:bg-white"
                        >
                          <span className="text-sm font-semibold">{c.name}</span>
                          <input
                            type="radio"
                            name="cat"
                            checked={selCat === c.slug}
                            onChange={() => setSelCat(c.slug)}
                          />
                        </label>
                      ))}
                    </div>
                  </details>

                  {/* Thương hiệu */}
                  <details className="border-b border-[#0b2bbf]/15 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                      <span>Thương hiệu</span>
                      <span className="opacity-70">▾</span>
                    </summary>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelBrand(null)}
                        className={[
                          "rounded-full border px-3 py-1 text-sm font-semibold",
                          selBrand === null
                            ? "border-[#0b2bbf]/40 bg-white"
                            : "border-[#0b2bbf]/15 bg-white/60",
                        ].join(" ")}
                      >
                        Tất cả
                      </button>

                      {brands.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelBrand(b.slug)}
                          className={[
                            "rounded-full border px-3 py-1 text-sm font-semibold",
                            selBrand === b.slug
                              ? "border-[#0b2bbf]/40 bg-white"
                              : "border-[#0b2bbf]/15 bg-white/60 hover:bg-white",
                          ].join(" ")}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </details>

                  {/* Thể tích / Khối lượng */}
                  <details className="border-b border-[#0b2bbf]/15 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                      <span>Thể tích / Khối lượng</span>
                      <span className="opacity-70">▾</span>
                    </summary>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelVol(null)}
                        className={[
                          "rounded-full border px-3 py-1 text-sm font-semibold",
                          selVol === null
                            ? "border-[#0b2bbf]/40 bg-white"
                            : "border-[#0b2bbf]/15 bg-white/60",
                        ].join(" ")}
                      >
                        Tất cả
                      </button>

                      {volOptions.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSelVol(v)}
                          className={[
                            "rounded-full border px-3 py-1 text-sm font-semibold",
                            selVol === v
                              ? "border-[#0b2bbf]/40 bg-white"
                              : "border-[#0b2bbf]/15 bg-white/60 hover:bg-white",
                          ].join(" ")}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </details>

                  {/* Phương thức giao hàng (text info) */}
                  <details className="py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                      <span>Phương thức giao hàng</span>
                      <span className="opacity-70">▾</span>
                    </summary>
                    <div className="pt-3 space-y-2 text-sm">
                      <p>
                        🚚 Vận chuyển đến tận nơi trong thời gian sớm nhất, cho phép kiểm tra hàng trước khi thanh toán.
                      </p>
                    </div>
                  </details>

                  {/* Clear */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={clearAll}
                      className="w-full rounded-xl border border-[#0b2bbf]/30 px-4 py-3 text-sm font-extrabold hover:bg-white/60"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  </div>
                </div>

                {/* footer buttons */}
                <div className="sticky bottom-0 bg-[#fffff2] border-t border-[#0b2bbf]/15 px-5 py-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-[#0b2bbf]/30 px-4 py-3 text-sm font-extrabold"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    className="flex-1 rounded-xl bg-[#0b2bbf] px-4 py-3 text-sm font-extrabold text-white hover:opacity-95"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
