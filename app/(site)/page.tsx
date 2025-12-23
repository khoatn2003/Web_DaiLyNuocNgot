import BannerSlider from "@/components/home/Banner";
import SiteHeader from "@/components/SiteHeader";
import { SITE } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatPackaging } from "@/lib/admin-utils";
import HomeRealtimeRefresh from "@/components/home/HomeRealtimeRefresh";
import CartNotReadyButton from "@/components/CartNotReadyButton";
export const revalidate = 60;
type UIProduct = {
  badge: string | null;
  name: string;
  code: string;
  desc: string;
  meta: string;
  img: string;
  in_stock: boolean;
  slug: string;

};

type UICategoryBlock = {
  title: string;
  href: string;
  products: UIProduct[];

};

async function getHomeCategoryBlocks(): Promise<UICategoryBlock[]> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, name, code, description, created_at,
      is_active, featured, featured_order, in_stock,
      packaging_override, package_type, pack_qty, unit, volume_ml, packaging,
      image_url,badge,
      category:categories ( id, name, slug ),
      images:product_images ( public_url, alt, is_primary, is_active, sort_order )
    `
    )
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("featured_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  // group theo category
  const byCat = new Map<string, UICategoryBlock>();
  for (const row of data) {
    const catRaw = (row as any).category;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;

if (!cat?.id || !cat?.name || !cat?.slug) continue;

    if (!cat) continue;

    // chọn ảnh: ưu tiên primary + active, fallback ảnh active sort_order thấp, fallback products.image_url, fallback placeholder
    const imgs = (row.images ?? []) as Array<{
      public_url: string;
      is_primary: boolean;
      is_active: boolean;
      sort_order: number;
    }>;

    const primary =
      imgs.find((x) => x.is_active && x.is_primary) ??
      imgs
        .filter((x) => x.is_active)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    const img =
      primary?.public_url ||
      (row.image_url as string | null) ||
      "/images/products/placeholder.png";

    // badge: tự suy ra (vì DB bạn chưa có cột badge)
    const isNew =
      row.created_at &&
      Date.now() - new Date(row.created_at as string).getTime() < 14 * 24 * 60 * 60 * 1000;

    const badgeText = typeof row.badge === "string" ? row.badge.trim() : "";

    const badge = row.in_stock === false ? "Hết hàng" 
                  : badgeText ? badgeText
                  : isNew? "Mới"
                  : null;
                  
    const meta = formatPackaging({
      packaging_override: row.packaging_override,
      package_type: row.package_type,
      pack_qty: row.pack_qty,
      unit: row.unit,
      volume_ml: row.volume_ml,
      packaging: row.packaging,
    });

    const product: UIProduct = {
      badge,
      name: row.name as string,
      code: (row.code as string | null) || (row.slug as string) || "",
      desc: (row.description as string | null) || "",
      meta,
      img,
      in_stock: row.in_stock,
      slug: row.slug,
    };

    if (!byCat.has(cat.id)) {
      byCat.set(cat.id, {
        title: cat.name,
        href: `/san-pham?cat=${cat.slug}`,
        products: [],
      });
    }

    byCat.get(cat.id)!.products.push(product);
  }

  // Mỗi danh mục lấy 3 sản phẩm để giống UI home
  const blocks = Array.from(byCat.values()).map((b) => ({
    ...b,
    products: b.products.slice(0, 3),
  }));

  // Home thường chỉ show 2-3 danh mục
  return blocks.slice(0, 3);
}

export default async function HomePage() {
 const categoryBlocks = await getHomeCategoryBlocks();
  return (
    <>
    <HomeRealtimeRefresh />
    {/* Header */}
    {/* <SiteHeader phone={phone} zaloLink={zaloLink} /> */}
    <main className="min-h-screen bg-white">
      {/* Banner */}
      <BannerSlider />
      {/* Hero */} 
     {/* Products by Category (giống form Vinamilk) */}
      <section className="bg-[#fbf7ea] border-y border-[#0b2bbf]/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0b2bbf]">
                Sản phẩm theo các loại mặt hàng
              </h2>
              <p className="mt-1 text-sm text-[#0b2bbf]/70">
                Chọn nhanh theo nhóm sản phẩm phổ biến.
              </p>
            </div>

            {/* <Link
              href="/san-pham"
              className="text-sm font-semibold text-[#0b2bbf] hover:underline underline-offset-4"
            >
              Xem tất cả →
            </Link> */}
          </div>
         {/* Divider */}
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#0b2bbf]/25 to-transparent" />

          {/* Danh mục */}
          <div className="mt-10 space-y-12">
            {categoryBlocks.map((cat) => (
              <CategoryBlock key={cat.href} title={cat.title} href={cat.href} products={cat.products} />
            ))}

          </div>
        </div>
      </section>

    </main>
    </>
  );
}

// function formatVND(n: number) {
//   return n.toLocaleString("vi-VN") + "đ";
// }
function CategoryBlock({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Array<{
    badge: string | null;
    name: string;
    code: string; // thêm mã
    desc: string;
    meta: string;
    img: string;
    in_stock: boolean;
    slug: string;
  }>;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#0b2bbf]">{title}</h3>
        <Link
          href={href}
          className="text-sm font-semibold text-[#0b2bbf] hover:underline underline-offset-4"
        >
          Xem →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <ProductCard key={p.code} p={p} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  p,
}: {
  p: {
    badge: string | null;
    name: string;
    code: string;
    slug: string;
    desc: string;
    meta: string;
    img: string;
    in_stock?: boolean; // thêm field này nếu bạn truyền
  };
}) {
  const out = p.badge === "Hết hàng" || p.in_stock === false; // an toàn 2 kiểu   
  return (
    <div
      className={[
        "group relative h-full w-full border-b border-[#0b2bbf]/15 py-6 transition-all duration-300",
        out ? "opacity-95" : "hover:-translate-y-1 hover:shadow-2xl",
      ].join(" ")}
    >
      <div
        className={[
          "bg-[#fbf7ea] flex h-full flex-col rounded-2xl ring-1 ring-transparent transition overflow-hidden",
          out ? "ring-[#0b2bbf]/10" : "group-hover:ring-[#0b2bbf]/20",
        ].join(" ")}
      >
        {/* Badge */}
        {p.badge && (
          <div className="w-full px-4 pt-4">
            <div className="relative h-6">
              <div className="absolute left-0 top-0 z-[1] flex flex-col gap-1">
                <span
                  className={[
                    "w-fit rounded-md px-2 py-1 text-[11px] font-bold ring-1",
                    out
                      ? "bg-red-600 text-white ring-red-600/30"
                      : "bg-white text-[#0b2bbf] ring-[#0b2bbf]/15",
                  ].join(" ")}
                >
                  {p.badge}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ảnh */}
        <Link href={`/san-pham/${p.slug}`} className="block text-[#0b2bbf]">
          <div className="relative overflow-hidden pt-[90%]">
            <Image
              src={p.img}
              alt={p.name}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className={[
                "h-full w-full object-contain transition-transform duration-200",
                out
                  ? "grayscale opacity-60"
                  : "group-hover:scale-[1.08]",
              ].join(" ")}
            />

            {/* Overlay “Hết hàng” nhẹ trên ảnh */}
            {out && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-black/55 text-white text-xs font-bold px-3 py-1">
                  Tạm hết hàng
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Nội dung */}
        <div className="flex grow flex-col px-4">
          <div className="mt-4 flex items-start justify-between gap-3">
            <h3 className="text-base md:text-lg font-extrabold tracking-tight text-[#0b2bbf]">
              {p.name}
            </h3>

            {/* <button
              type="button"
              disabled={out}
              className={[
                "p-2 rounded-full text-[#0b2bbf] transition",
                out
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-[#0b2bbf]/10",
              ].join(" ")}
              aria-label={out ? "Hết hàng" : "Thêm vào giỏ"}
              title={out ? "Hết hàng" : "Thêm vào giỏ"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 7h15l-1.5 9h-12L6 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 7 5 3H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button> */}
            <CartNotReadyButton disabled={out} productName={p.name} />

          </div>

          <p className="my-2 text-sm text-[#0b2bbf]/75 line-clamp-2 leading-relaxed">
            {p.desc}
          </p>

          <div className="mt-auto pb-4">
            <p className="text-xs font-semibold text-[#0b2bbf]/80 bg-white/70 px-2 py-1 rounded w-fit">
              {p.meta}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-[#0b2bbf]/70">
                Mã: <span className="font-bold text-[#0b2bbf]">{p.code}</span>
              </div>

              <Link
                href="/lien-he"
                className="text-sm font-extrabold text-[#0b2bbf] hover:underline underline-offset-4"
              >
                Liên hệ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}

