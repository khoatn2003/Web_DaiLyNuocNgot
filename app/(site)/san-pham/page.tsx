import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPackaging } from "@/lib/admin-utils";
import { Home } from "lucide-react";
import HomeRealtimeRefresh from "@/components/home/HomeRealtimeRefresh";

type SP = {
  search?: string;
  page?: string;
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

function pickPrimaryImage(images: any[] | null | undefined) {
  const arr = (images ?? []).filter((x) => x?.is_active !== false);
  arr.sort((a, b) => {
    // ưu tiên is_primary, rồi sort_order
    const ap = a?.is_primary ? 1 : 0;
    const bp = b?.is_primary ? 1 : 0;
    if (bp !== ap) return bp - ap;
    return (a?.sort_order ?? 0) - (b?.sort_order ?? 0);
  });
  return arr[0]?.public_url ?? "/images/placeholder.png";
}

function buildBadge(row: any) {
  // 1) hết hàng override
  if (row.in_stock === false) return "Hết hàng";

  // 2) nếu có badge trong DB -> dùng luôn
  if (row.badge) return String(row.badge);

  // 3) nếu không có badge, check isNew (ví dụ 14 ngày)
  const created = row.created_at ? new Date(row.created_at).getTime() : 0;
  const days14 = 14 * 24 * 60 * 60 * 1000;
  const isNew = created && Date.now() - created <= days14;

  return isNew ? "Mới" : null;
}

export default async function ProductsPage({
   searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createSupabaseServer();
  const sp = await searchParams;
  //   const sp: SP = {
  //   search: typeof searchParams.search === "string" ? searchParams.search : "",
  //   page: typeof searchParams.page === "string" ? searchParams.page : "1",
  // };
   const q =
    typeof sp.search === "string"
      ? sp.search
      : Array.isArray(sp.search)
      ? sp.search[0] ?? ""
      : "";

   const page =
    typeof sp.page === "string"
      ? parseInt(sp.page, 10) || 1
      : 1;
  const PAGE_SIZE = 12;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // 1) Lấy danh mục để render tabs + filter
  const { data: allCats } = await supabase
    .from("categories")
    .select("id,name,slug")
    .order("name", { ascending: true });

  // 2) Query sản phẩm + join brand/category/images
  let qb = supabase
    .from("products")
    .select(
      `
      id, slug, name, description, price, code, in_stock, badge, created_at,
      packaging_override, package_type, pack_qty, unit, volume_ml, packaging,
      brand:brands(name),
      category:categories(id,name,slug),
      images:product_images(public_url,is_primary,sort_order,is_active)
    `,
      { count: "exact" }
    )
    .eq("is_active", true);

  // Search theo name/description/code
  if (q) {
    // tránh ký tự gây vỡ chuỗi .or
    const safe = q.replaceAll("%", "").replaceAll("_", "").replaceAll(",", " ");
    qb = qb.or(
      `name.ilike.%${safe}%,description.ilike.%${safe}%,code.ilike.%${safe}%`
    );
  }

  const { data, count, error } = await qb
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <main className="min-h-screen bg-[#fffff2] text-[#0b2bbf] p-6">
        Lỗi tải sản phẩm: {error.message}
      </main>
    );
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const products: UIProduct[] = (data ?? []).map((row: any) => {
    const packText = formatPackaging(row) || "";
    const img = pickPrimaryImage(row.images);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      desc: row.description ?? null,
      img,
      in_stock: row.in_stock !== false,
      badge: buildBadge(row),
      brandName: row.brand?.name ?? null,
      packText,
      priceText: row.price ? formatVND(row.price) : "Liên hệ",
    };
  });

  const title = q ? q : `Sản phẩm`;
  const basePath = "/san-pham";

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
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">{title}</h1>
            <span className="mt-2 text-lg font-semibold opacity-80 lg:mt-4">{total}</span>
          </div>

          {q ? (
            <div className="text-sm font-semibold opacity-80">
              Từ khoá: <span className="font-extrabold">{q}</span>
            </div>
          ) : null}
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:items-start">
          {/* LEFT FILTERS (giữ layout, bạn muốn thêm lọc sau cũng ok) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-90px)] lg:overflow-auto self-start">
            <div className="mb-3 rounded-2xl border border-[#0b2bbf]/15 bg-white/50 px-4 py-3 lg:hidden">
              <div className="text-sm font-extrabold">Bộ lọc</div>
              <div className="mt-1 text-xs opacity-70">Chọn lọc để thu hẹp sản phẩm</div>
            </div>

            <div className="rounded-2xl border border-[#0b2bbf]/10 bg-transparent">
              <details open className="px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold">
                  <span>Gợi ý</span>
                  <span className="opacity-70">▾</span>
                </summary>
                <div className="pt-2 text-sm opacity-80">
                  Bạn đang {q ? "tìm kiếm theo từ khoá." : "xem toàn bộ sản phẩm."}
                </div>
              </details>
            </div>
          </aside>

          {/* RIGHT PRODUCTS */}
          <section className="lg:col-span-3 min-w-0">
            <div
              className={[
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0",
                "border-t border-[#0b2bbf]/10",
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
                  {/* Badge (ẩn nếu null) */}
                  <div className="h-6">
                    {p.badge ? (
                      <span
                        className={[
                          "inline-flex rounded-md px-2 py-1 text-[11px] font-extrabold",
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

            {/* Pagination tối giản */}
            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
                <Link
                  href={`${basePath}?${new URLSearchParams({
                    ...(q ? { search: q } : {}),
                    page: String(Math.max(1, page - 1)),
                  }).toString()}`}
                  className={[
                    "rounded-full border px-4 py-2",
                    page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-white/60",
                  ].join(" ")}
                >
                  ← Trước
                </Link>

                <span className="opacity-80">
                  {page} / {totalPages}
                </span>

                <Link
                  href={`${basePath}?${new URLSearchParams({
                    ...(q ? { search: q } : {}),
                    page: String(Math.min(totalPages, page + 1)),
                  }).toString()}`}
                  className={[
                    "rounded-full border px-4 py-2",
                    page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-white/60",
                  ].join(" ")}
                >
                  Sau →
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </div>
      <HomeRealtimeRefresh></HomeRealtimeRefresh>
    </main>
  );
}
