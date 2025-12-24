"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type Cat = { id: string; name: string; slug: string };
type Brand = { id: string; name: string; slug: string };

// SP của bạn đang dùng (brand/sort/vol/page...)
type SP = Record<string, string | undefined>;

function buildHref(basePath: string, sp: SP, patch: Record<string, string | null>) {
  const params = new URLSearchParams();

  // copy sp hiện tại
  Object.entries(sp).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  // apply patch
  Object.entries(patch).forEach(([k, v]) => {
    if (v === null) params.delete(k);
    else params.set(k, v);
  });

  return `${basePath}?${params.toString()}`;
}

export default function MobileFiltersSheet({
  basePath,
  sp,
  catSlug,
  allCats,
  brands,
  volOptions,
  sort,
}: {
  basePath: string;
  sp: SP;
  catSlug: string;
  allCats: Cat[];
  brands: Brand[];
  volOptions: string[];
  sort: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // local selections (để nút "Áp dụng" giống ảnh)
  const [selSort, setSelSort] = useState(sort);
  const [selBrand, setSelBrand] = useState<string | null>(sp.brand ?? null);
  const [selVol, setSelVol] = useState<string | null>(sp.vol ?? null);
  const [selCat, setSelCat] = useState<string>(catSlug);

  useEffect(() => setMounted(true), []);

  // mỗi lần mở sheet thì đồng bộ state theo URL hiện tại
  useEffect(() => {
    if (!open) return;
    setSelSort(sort);
    setSelBrand(sp.brand ?? null);
    setSelVol(sp.vol ?? null);
    setSelCat(catSlug);

    // khóa scroll nền
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, sort, sp.brand, sp.vol, catSlug]);

  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const apply = () => {
    const nextBase = `/san-pham/danh-muc/${selCat}`;

    // reset page về 1 khi đổi filter
    const href = buildHref(nextBase, sp, {
      sort: selSort || null,
      brand: selBrand,
      vol: selVol,
      page: "1",
    });

    setOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Mobile filter bar (chỉ hiện trên mobile) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden w-full mb-4 rounded-2xl border border-[#0b2bbf]/15 bg-white/50 px-4 py-3 text-left hover:bg-white/70"
      >
        <div className="text-sm font-extrabold">Bộ lọc</div>
        <div className="mt-1 text-xs opacity-70">Chọn lọc để thu hẹp sản phẩm</div>
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
                          selBrand === null ? "border-[#0b2bbf]/40 bg-white" : "border-[#0b2bbf]/15 bg-white/60",
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
                          selVol === null ? "border-[#0b2bbf]/40 bg-white" : "border-[#0b2bbf]/15 bg-white/60",
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

                  {/* Phương thức giao hàng (text info như bạn đang có) */}
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
