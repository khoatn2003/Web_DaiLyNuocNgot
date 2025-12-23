import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPackaging } from "@/lib/admin-utils";
import SortSelect from "./sort-select";
import HomeRealtimeRefresh from "@/components/home/HomeRealtimeRefresh";

const PAGE_SIZE = 9; // giống layout ảnh (3 cột x 3 hàng) bạn đổi tuỳ ý

function formatVND(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function normalizeSearchParams(sp: any) {
  const out: Record<string, string> = {};
  if (!sp) return out;
  for (const k of Object.keys(sp)) {
    const v = sp[k];
    out[k] = Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  }
  return out;
}

function buildHref(base: string, current: Record<string, string>, patch: Record<string, string | null>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) if (v) usp.set(k, v);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") usp.delete(k);
    else usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

function pickPrimaryImage(images: any[] | null | undefined) {
  const list = (images ?? []).filter((x) => x?.is_active !== false);
  list.sort((a, b) => {
    const ap = a?.is_primary ? 1 : 0;
    const bp = b?.is_primary ? 1 : 0;
    if (bp !== ap) return bp - ap;
    return (a?.sort_order ?? 0) - (b?.sort_order ?? 0);
  });
  return list[0]?.public_url ?? "https://placehold.co/600x600";
}

function pageItems(totalPages: number, page: number) {
  // 1 ... (page-1) page (page+1) ... total
  const items: (number | "...")[] = [];
  const add = (x: number | "...") => items.push(x);

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) add(i);
    return items;
  }

  add(1);
  if (page > 3) add("...");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) add(i);

  if (page < totalPages - 2) add("...");
  add(totalPages);

  return items;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();

  const { slug } = await params;
  const sp = normalizeSearchParams(searchParams ? await searchParams : {});

  const page = Math.max(1, Number(sp.page || "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServer();

  // categories nav top
  const catsRes = await supabase.from("categories").select("id,name,slug").order("name");
  const allCats = (catsRes.data ?? []) as any[];

  // current category
  const catRes = await supabase.from("categories").select("id,name,slug").eq("slug", slug).maybeSingle();
  if (catRes.error) return <div className="p-6">Lỗi: {catRes.error.message}</div>;
  if (!catRes.data) return <div className="p-6">Không tìm thấy danh mục.</div>;
  const cat = catRes.data;

  // brands for filter
  const brRes = await supabase.from("brands").select("id,name,slug").order("name");
  const brands = (brRes.data ?? []) as any[];

  // resolve brand filter -> brand_id
  const brandObj = sp.brand ? brands.find((b) => b.slug === sp.brand) : null;
  const brandId = brandObj?.id ?? null;

  // sort
  const sort = sp.sort || "lien-quan";
  const order =
    sort === "moi-nhat"
      ? { col: "created_at", asc: false }
      : sort === "gia-tang"
      ? { col: "price", asc: true }
      : sort === "gia-giam"
      ? { col: "price", asc: false }
      : { col: "featured_order", asc: true };

  // query products (category) + join images (primary in code)
  let q = supabase
    .from("products")
    .select(
      `
      id, slug, name, code, price, description, in_stock, is_active,
      packaging_override, package_type, pack_qty, unit, volume_ml, packaging,
      brand:brands ( id, name, slug ),
      images:product_images ( public_url, alt, is_primary, is_active, sort_order )
    `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .eq("category_id", cat.id);

  if (brandId) q = q.eq("brand_id", brandId);

  // volume filter (ml/L theo volume_ml)
  if (sp.vol) {
    const m = sp.vol.trim().match(/^(\d+(?:\.\d+)?)(ml|l|g|kg)$/i);
    if (m) {
      const num = Number(m[1]);
      const unit = m[2].toLowerCase();
      if (unit === "ml") q = q.eq("volume_ml", Math.round(num));
      if (unit === "l") q = q.eq("volume_ml", Math.round(num * 1000));
      // g/kg: fallback text search (vì DB chưa có cột weight)
      if (unit === "g" || unit === "kg") {
        const needle = sp.vol.toLowerCase();
        q = q.or(`packaging_override.ilike.%${needle}%,packaging.ilike.%${needle}%`);
      }
    }
  }

  // delivery filter: hiện là UI (DB chưa có field)
  // nếu sau này thêm field delivery_method => filter ở đây

  q = q.order(order.col, { ascending: order.asc }).order("name").range(from, to);

  const prodRes = await q;
  if (prodRes.error) return <div className="p-6">Lỗi: {prodRes.error.message}</div>;

  const total = prodRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const basePath = `/san-pham/danh-muc/${cat.slug}`;

  const products = (prodRes.data ?? []).map((p: any) => {
    const img = pickPrimaryImage(p.images);
    const packText = formatPackaging(p) || "";
    const priceText = p.price ? formatVND(p.price) : "Liên hệ";
    const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      code: p.code,
      desc: p.description ?? "",
      img,
      packText,
      priceText,
      in_stock: p.in_stock,
      brandName: brand?.name ?? "",
    };
  });

  // preset vol options (gọn như UI ảnh)
  const volOptions = ["180ml", "220ml", "330ml", "500ml", "1L", "200g", "400g", "900g"];

  const deliveryOptions = [
    { key: "ship", label: "Giao 2H" },
    { key: "pickup", label: "Nhận tại cửa hàng" },
  ];

  return (
    <>
 <main className="min-h-screen bg-[#fffff2] text-[#0b2bbf]">
  <div className="mx-auto max-w-7xl px-4 pb-12">
    {/* TOP: Tabs danh mục (sticky giống hình) */}
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
          {allCats.map((c) => (
            <Link
              key={c.id}
              href={`/san-pham/danh-muc/${c.slug}`}
              className={[
                "whitespace-nowrap px-1 pb-2",
                c.slug === cat.slug
                  ? "border-b-4 border-[#0b2bbf] font-extrabold"
                  : "opacity-70 hover:opacity-100",
              ].join(" ")}
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
      <span className="opacity-50">›</span>
      <span className="font-semibold">{cat.name}</span>
    </nav>

    {/* Header + Sort */}
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-start gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">{cat.name}</h1>
        <span className="mt-2 text-lg font-semibold opacity-80 lg:mt-4">{total}</span>
      </div>

      <div className="lg:mt-0">
        <SortSelect basePath={basePath} current={sp} value={sort} />
      </div>
    </div>

    {/* MAIN */}
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:items-start">
      {/* LEFT FILTERS */}
       {/* <aside className="lg:col-span-1 lg:max-w-[320px] lg:w-full"> */}
       <aside className="lg:col-span-1 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-90px)] lg:overflow-auto self-start">
        {/* Mobile header nhỏ gọn */}
        <div className="mb-3 rounded-2xl border border-[#0b2bbf]/15 bg-white/50 px-4 py-3 lg:hidden">
          <div className="text-sm font-extrabold">Bộ lọc</div>
          <div className="mt-1 text-xs opacity-70">Chọn lọc để thu hẹp sản phẩm</div>
        </div>

        {/* Khối filter: style gọn như hình */}
        <div className="rounded-2xl border border-[#0b2bbf]/10 bg-transparent">
          {/* Danh mục */}
          <details open className="border-b border-[#0b2bbf]/10 px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
              <span>Danh mục</span>
              <span className="opacity-70">▾</span>
            </summary>
            <div className="pt-2 space-y-1">
              {allCats.map((c) => (
                <Link
                  key={c.id}
                  href={`/san-pham/danh-muc/${c.slug}`}
                  className={[
                    "block rounded-xl px-2 py-2 text-sm hover:bg-white/60",
                    c.slug === cat.slug ? "font-extrabold" : "opacity-90",
                  ].join(" ")}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </details>

          {/* Thương hiệu */}
          <details open className="border-b border-[#0b2bbf]/10 px-4 py-3">
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
              {brands.map((b) => (
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

          {/* Thể tích / Khối lượng */}
          <details open className="border-b border-[#0b2bbf]/10 px-4 py-3">
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

          {/* Phương thức giao hàng */}
          <details open className="px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
              <span>Phương thức giao hàng</span>
              <span className="opacity-70">▾</span>
            </summary>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link
                href={buildHref(basePath, sp, { delivery: null, page: "1" })}
                className={[
                  "rounded-full border px-3 py-1 text-sm font-semibold",
                  sp.delivery ? "border-[#0b2bbf]/15 bg-white/50" : "border-[#0b2bbf]/30 bg-white",
                ].join(" ")}
              >
                Tất cả
              </Link>
              {deliveryOptions.map((d) => (
                <Link
                  key={d.key}
                  href={buildHref(basePath, sp, { delivery: d.key, page: "1" })}
                  className={[
                    "rounded-full border px-3 py-1 text-sm font-semibold",
                    sp.delivery === d.key
                      ? "border-[#0b2bbf]/30 bg-white"
                      : "border-[#0b2bbf]/15 bg-white/50 hover:bg-white",
                  ].join(" ")}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </aside>

      {/* RIGHT PRODUCTS */}
      <section className="lg:col-span-3 min-w-0">
        {/* Grid kiểu "kẻ line" gọn như hình */}
        <div
          className={[
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0",
            "border-t border-[#0b2bbf]/10",
            // kẻ line dọc theo cột (sm=2, lg=3)
            "sm:[&>*]:border-r sm:[&>*]:border-[#0b2bbf]/10 sm:[&>*:nth-child(2n)]:border-r-0",
            "lg:[&>*:nth-child(3n)]:border-r-0",
          ].join(" ")}
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/san-pham/${p.slug}`}
              className="group border-b border-[#0b2bbf]/10 px-4 py-8 transition hover:bg-white/35"
            >
              {/* Badge */}
              {/* <div className="h-6">
                {!p.in_stock ? (
                  <span className="inline-flex rounded-md bg-rose-100 px-2 py-1 text-[11px] font-extrabold text-rose-700">
                    Hết hàng
                  </span>
                ) : p.badge ? (
                  <span className="inline-flex rounded-md bg-white px-2 py-1 text-[11px] font-extrabold text-[#0b2bbf] ring-1 ring-[#0b2bbf]/15">
                    {p.badge}
                  </span>
                ) : null}
              </div> */}

              {/* Image */}
              <div className="mx-auto mt-6 flex h-[220px] items-center justify-center">
                <img src={p.img} alt={p.name} className="h-full w-auto object-contain" />
              </div>

              {/* Content */}
              <div className="mt-6">
                <div className="text-xs font-semibold opacity-70">{p.brandName || " "}</div>

                <div className="mt-1 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-extrabold leading-tight group-hover:underline">
                    {p.name}
                  </h3>

                  {/* icon nhỏ (tuỳ bạn thay icon cart) */}
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#0b2bbf]/15 bg-white/60 opacity-80 group-hover:opacity-100">
                    +
                  </span>
                </div>

                {p.desc ? (
                  <div className="mt-2 line-clamp-2 text-sm opacity-70">{p.desc}</div>
                ) : (
                  <div className="mt-2 h-[40px]" />
                )}

                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold opacity-80">{p.packText || " "}</div>
                  <div className="text-right text-lg font-extrabold">{p.priceText}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination (giữ logic bạn đang có, chỉ đổi style cho giống hình) */}
        {totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center">
            <ul className="flex items-center gap-2 text-sm font-semibold" aria-label="Pagination">
              {/* ví dụ bạn render pages: prev / numbers / next */}
              {/* chỉ cần bọc mỗi item bằng class như dưới */}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  </div>
</main>

<HomeRealtimeRefresh ></HomeRealtimeRefresh>
</>
);

}
