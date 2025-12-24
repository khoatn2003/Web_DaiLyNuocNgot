import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPackaging } from "@/lib/admin-utils";
import { getOne, pickPrimaryImage, normalizeSearchParams } from "@/lib/sanpham-utils";
import Pagination from "@/components/Pagination";
import HomeRealtimeRefresh from "@/components/home/HomeRealtimeRefresh";
import SortSelect from "./danh-muc/[slug]/sort-select";
import MobileFiltersSheetSanPham from "@/components/san-pham/danh-muc/MobileFiltersSheetSanPham";
// import SortSelect from "@/components/SortSelect"; // nếu bạn đã tạo component này

type SP = {
  search?: string;
  page?: string;
  sort?: string;  // lien-quan | moi-nhat | gia-tang | gia-giam
  cat?: string;   // category slug
  brand?: string; // brand slug
  vol?: string;   // 330ml | 1L | 400g...
};

type UIProduct = {
  id: string;
  slug: string;
  name: string;
  desc: string | null;
  img: string;
  in_stock: boolean;
  badge: string | null;
  brandName: string | null;
  packText: string;
  priceText: string;
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function buildBadge(row: any) {
  if (row.in_stock === false) return "Hết hàng";
  if (row.badge) return String(row.badge);

  const created = row.created_at ? new Date(row.created_at).getTime() : 0;
  const days14 = 14 * 24 * 60 * 60 * 1000;
  const isNew = created && Date.now() - created <= days14;

  return isNew ? "Mới" : null;
}

function safeOrTerm(input: string) {
  // tránh vỡ chuỗi supabase .or(...)
  return input
    .replaceAll("%", "")
    .replaceAll("_", "")
    .replaceAll(",", " ")
    .replaceAll("'", "")
    .trim();
}

// (dùng cho link filter/pagination nếu bạn cần)
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ✅ nếu bạn muốn luôn fresh giống trang danh mục
  noStore();

  const supabase = await createSupabaseServer();
  const sp = normalizeSearchParams(await searchParams) as SP;

  // ---- Read params
  const q = (sp.search || "").trim();
  const sort = sp.sort || "moi-nhat";
  const catSlug = sp.cat || "";
  const brandSlug = sp.brand || "";
  const vol = sp.vol || "";

  const page = Math.max(1, Number(sp.page || "1") || 1);
  const PAGE_SIZE = 9;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // ---- Load filter options (cats, brands)
  const [catsRes, brandsRes] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name"),
    supabase.from("brands").select("id,name,slug").order("name"),
  ]);

  const allCats = (catsRes.data ?? []) as any[];
  const brands = (brandsRes.data ?? []) as any[];

  // resolve slug -> id
  const catObj = catSlug ? allCats.find((c) => c.slug === catSlug) : null;
  const brandObj = brandSlug ? brands.find((b) => b.slug === brandSlug) : null;

  // ---- Base query
  let qb = supabase
    .from("products")
    .select(
      `
      id, slug, name, description, price, code, in_stock, badge, created_at,
      packaging_override, package_type, pack_qty, unit, volume_ml, packaging,
      brand:brands ( id, name, slug ),
      category:categories(id,name,slug),
      images:product_images(public_url,is_primary,sort_order,is_active)
    `,
      { count: "exact" }
    )
    .eq("is_active", true);

  // ---- Search
  if (q) {
    const safe = safeOrTerm(q);
    if (safe) {
      qb = qb.or(
        `name.ilike.%${safe}%,description.ilike.%${safe}%,code.ilike.%${safe}%`
      );
    }
  }

  // ---- Filters
  if (catObj?.id) qb = qb.eq("category_id", catObj.id);
  if (brandObj?.id) qb = qb.eq("brand_id", brandObj.id);

  // vol filter (ml/L theo volume_ml, g/kg fallback text)
  if (vol) {
    const m = vol.trim().match(/^(\d+(?:\.\d+)?)(ml|l|g|kg)$/i);
    if (m) {
      const num = Number(m[1]);
      const unit = m[2].toLowerCase();
      if (unit === "ml") qb = qb.eq("volume_ml", Math.round(num));
      if (unit === "l") qb = qb.eq("volume_ml", Math.round(num * 1000));
      if (unit === "g" || unit === "kg") {
        const needle = vol.toLowerCase();
        qb = qb.or(
          `packaging_override.ilike.%${needle}%,packaging.ilike.%${needle}%`
        );
      }
    }
  }

  // ---- Sort
  if (sort === "moi-nhat") qb = qb.order("created_at", { ascending: false });
  else if (sort === "gia-tang") qb = qb.order("price", { ascending: true });
  else if (sort === "gia-giam") qb = qb.order("price", { ascending: false });
  else qb = qb.order("featured_order", { ascending: true }).order("created_at", { ascending: false });

  // ---- Pagination
  const { data, count, error } = await qb.range(from, to);

  if (error) {
    return (
      <main className="min-h-screen bg-[#fffff2] text-[#0b2bbf] p-6">
        Lỗi tải sản phẩm: {error.message}
      </main>
    );
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ---- Map UI
  const products: UIProduct[] = (data ?? []).map((row: any) => {
    const packText = formatPackaging(row) || "";
    const img = pickPrimaryImage(row.images);
    const brand = getOne(row.brand);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      desc: row.description ?? null,
      img,
      in_stock: row.in_stock !== false,
      badge: buildBadge(row),
      brandName: brand?.name ?? null,
      packText,
      priceText: row.price ? formatVND(row.price) : "Liên hệ",
    };
  });

  const title = q ? q : "Sản phẩm";
  const basePath = "/san-pham";

  // options (dùng cho UI filter)
  const volOptions = ["180ml", "220ml", "330ml", "500ml", "1L", "200g", "400g", "900g"];

  // ... return UI của bạn ở dưới (header + aside + grid + pagination)
  // Nhớ truyền Pagination params đủ filter để giữ trạng thái:
  // params={{
  //   ...(q ? { search: q } : {}),
  //   ...(catSlug ? { cat: catSlug } : {}),
  //   ...(brandSlug ? { brand: brandSlug } : {}),
  //   ...(vol ? { vol } : {}),
  //   ...(sort ? { sort } : {}),
  // }}

  return (
    <main className="min-h-screen bg-[#fffff2] text-[#0b2bbf]">
      <div className="mx-auto max-w-7xl px-4 pb-12">
        {/* TOP: Tabs danh mục */}
        <div className="sticky top-0 z-30 -mx-4 bg-[#fbf7ea]/90 px-4 backdrop-blur">
          <div className="border-b border-[#0b2bbf]/10">
            <div className="no-scrollbar flex items-center gap-6 overflow-x-auto py-3 text-sm font-semibold">
              <Link
                href="/san-pham"
                className={[
                  "whitespace-nowrap px-1 pb-2",
                  !q ? "border-b-4 border-[#0b2bbf] font-extrabold" : "opacity-70 hover:opacity-100",
                ].join(" ")}
              >
                Tất cả
              </Link>

              {(allCats ?? []).map((c) => (
                <Link
                  key={c.id}
                  href={`/san-pham/danh-muc/${c.slug}`}
                  className="whitespace-nowrap px-1 pb-2 opacity-70 hover:opacity-100"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="mt-4 mb-3 flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="inline-flex items-center gap-2 hover:underline">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#0b2bbf]/20 bg-white/60">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 10v10h14V10" />
              </svg>
            </span>
          </Link>
          <span className="opacity-50">›</span>
          <Link href="/san-pham" className="hover:underline">
            Sản phẩm
          </Link>
          {q ? (
            <>
              <span className="opacity-50">›</span>
              <span className="font-mono text-technical-sm text-vnm-secondary capitalize " aria-disabled="true">Kết quả tìm kiếm</span>
              <span className="opacity-50">›</span>
              <span className="font-semibold"> “{q}”</span>
            </>
          ) : null}
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-start gap-2">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">{title}</h1>
              <span className="mt-2 text-lg font-semibold opacity-80 lg:mt-4">{total}</span>
            </div>

            {q ? (
              <div className="mt-2 text-sm font-semibold opacity-80">
                Từ khoá: <span className="font-extrabold">{q}</span>
              </div>
            ) : null}

             <div className="mt-3 lg:hidden">
                <MobileFiltersSheetSanPham
                  basePath={basePath}
                  current={sp}
                  allCats={allCats}
                  brands={brands}
                  volOptions={volOptions}
                  defaultSort="moi-nhat"
                />
              </div>
          </div>

          {/* SortSelect (ẩn mobile nếu bạn muốn đưa sort vào modal sau này) */}
          <div className="hidden lg:block">
            <SortSelect basePath={basePath} current={sp} value={sort} />
          </div>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:items-start">
          {/* LEFT FILTERS (giữ layout, bạn muốn thêm lọc sau cũng ok) */}
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-90px)] lg:overflow-auto self-start">
            {/* Mobile header nhỏ */}
            <div className="mb-3 rounded-2xl border border-[#0b2bbf]/15 bg-white/50 px-4 py-3 lg:hidden">
              <div className="text-sm font-extrabold">Bộ lọc</div>
              <div className="mt-1 text-xs opacity-70">Chọn lọc để thu hẹp sản phẩm</div>
            </div>

            <div className="rounded-2xl border border-[#0b2bbf]/10 bg-transparent">
              {/* Gợi ý */}
              <details open className="border-b border-[#0b2bbf]/10 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                  <span>Gợi ý</span>
                  <span className="opacity-70">▾</span>
                </summary>
                <div className="pt-2 text-sm opacity-80">
                  Bạn đang {q ? "tìm kiếm theo từ khoá." : "xem toàn bộ sản phẩm."}
                </div>
              </details>

              {/* Danh mục */}
              <details className="border-b border-[#0b2bbf]/10 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                  <span>Danh mục</span>
                  <span className="opacity-70">▾</span>
                </summary>

                <div className="pt-2 space-y-1">
                  <Link
                    href={buildHref(basePath, sp, { cat: null, page: "1" })}
                    className={[
                      "block rounded-xl px-2 py-2 text-sm hover:bg-white/60",
                      !sp.cat ? "font-extrabold" : "opacity-90",
                    ].join(" ")}
                  >
                    Tất cả
                  </Link>

                  {(allCats ?? []).map((c: any) => (
                    <Link
                      key={c.id}
                      href={buildHref(basePath, sp, { cat: c.slug, page: "1" })}
                      className={[
                        "block rounded-xl px-2 py-2 text-sm hover:bg-white/60",
                        sp.cat === c.slug ? "font-extrabold" : "opacity-90",
                      ].join(" ")}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </details>

              {/* Thương hiệu */}
              <details className="border-b border-[#0b2bbf]/10 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                  <span>Thương hiệu</span>
                  <span className="opacity-70">▾</span>
                </summary>

                <div className="pt-2 flex flex-wrap gap-2">
                  <Link
                    href={buildHref(basePath, sp, { brand: null, page: "1" })}
                    className={[
                      "rounded-full border px-3 py-1 text-sm font-semibold",
                      sp.brand ? "border-[#0b2bbf]/15 bg-white/50" : "border-[#0b2bbf]/30 bg-white",
                    ].join(" ")}
                  >
                    Tất cả
                  </Link>

                  {brands.map((b: any) => (
                    <Link
                      key={b.id}
                      href={buildHref(basePath, sp, { brand: b.slug, page: "1" })}
                      className={[
                        "rounded-full border px-3 py-1 text-sm font-semibold",
                        sp.brand === b.slug
                          ? "border-[#0b2bbf]/30 bg-white"
                          : "border-[#0b2bbf]/15 bg-white/50 hover:bg-white",
                      ].join(" ")}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </details>

              {/* Thể tích */}
              <details className="px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                  <span>Thể tích / Khối lượng</span>
                  <span className="opacity-70">▾</span>
                </summary>

                <div className="pt-2 flex flex-wrap gap-2">
                  <Link
                    href={buildHref(basePath, sp, { vol: null, page: "1" })}
                    className={[
                      "rounded-full border px-3 py-1 text-sm font-semibold",
                      sp.vol ? "border-[#0b2bbf]/15 bg-white/50" : "border-[#0b2bbf]/30 bg-white",
                    ].join(" ")}
                  >
                    Tất cả
                  </Link>

                  {volOptions.map((v) => (
                    <Link
                      key={v}
                      href={buildHref(basePath, sp, { vol: v, page: "1" })}
                      className={[
                        "rounded-full border px-3 py-1 text-sm font-semibold",
                        sp.vol === v
                          ? "border-[#0b2bbf]/30 bg-white"
                          : "border-[#0b2bbf]/15 bg-white/50 hover:bg-white",
                      ].join(" ")}
                    >
                      {v}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </aside>


          {/* RIGHT PRODUCTS */}
          <section className="lg:col-span-3 min-w-0">
            <div
              className={[
                "grid grid-cols-2 lg:grid-cols-3 gap-0",
                "border-t border-[#0b2bbf]/10",
                // 2 cột (mobile) -> bỏ border-r ở item thứ 2,4,6...
                "[&>*]:border-r [&>*]:border-[#0b2bbf]/10 [&>*:nth-child(2n)]:border-r-0",
                // 3 cột (lg) -> bỏ border-r ở item thứ 3,6,9...
                "lg:[&>*:nth-child(2n)]:border-r lg:[&>*:nth-child(3n)]:border-r-0",
              ].join(" ")} >
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/san-pham/${p.slug}`}
                  className="group border-b border-[#0b2bbf]/10 px-3 py-5 sm:px-4 sm:py-8 transition hover:bg-white/35"
                >
                  {/* Badge */}
                  <div className="h-6">
                    {p.badge ? (
                      <span
                        className={[
                          "inline-flex rounded-md px-2 py-1 text-[10px] sm:text-[11px] font-extrabold",
                          p.badge === "Hết hàng"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-white text-[#0b2bbf] ring-1 ring-[#0b2bbf]/15",
                        ].join(" ")}
                      >
                        {p.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* Image */}
                  <div className="mx-auto mt-4 sm:mt-6 flex h-[150px] sm:h-[220px] items-center justify-center">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-4 sm:mt-6">
                    <div className="text-[10px] sm:text-xs font-semibold opacity-70 line-clamp-1">
                      {p.brandName || " "}
                    </div>

                    <div className="mt-1 flex items-start justify-between gap-2">
                      <h3 className="text-base sm:text-xl font-extrabold leading-snug group-hover:underline line-clamp-2">
                        {p.name}
                      </h3>

                      <span className="mt-0.5 inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md border border-[#0b2bbf]/15 bg-white/60 opacity-80 group-hover:opacity-100">
                        +
                      </span>
                    </div>

                    {p.desc ? (
                      <div className="mt-2 line-clamp-2 text-xs sm:text-sm opacity-70 leading-relaxed">
                        {p.desc}
                      </div>
                    ) : (
                      <div className="mt-2 h-[32px] sm:h-[40px]" />
                    )}

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                      <div className="text-xs sm:text-sm font-semibold opacity-80 line-clamp-1">
                        {p.packText || " "}
                      </div>
                      <div className="text-left sm:text-right text-base sm:text-lg font-extrabold">
                        {p.priceText}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              basePath={basePath} // ví dụ "/san-pham"
              params={{
                // ...(cat ? { cat } : {}),
                 ...(q ? { search: q } : {}),
              ...(sp.cat ? { cat: sp.cat } : {}),
              ...(sp.brand ? { brand: sp.brand } : {}),
              ...(sp.vol ? { vol: sp.vol } : {}),
              ...(sort ? { sort } : {}),
              }}
            />

          </section>
        </div>
      </div>
      <HomeRealtimeRefresh></HomeRealtimeRefresh>
    </main>
  );
}
