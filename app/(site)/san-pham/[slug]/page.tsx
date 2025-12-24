
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClient";
import { SITE } from "@/lib/site";
// import { useMemo } from "react";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {

  const { slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: p } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!p) {
    return {
      title: "Không tìm thấy sản phẩm",
    };
  }

  return {
    title: `${p.name} | ${SITE.author}`,
    description: p.description ?? `Chi tiết sản phẩm ${p.name}`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
   params: Promise<{ slug: string }>;
}) {
  noStore();
   const { slug } = await params; 
   const supabase = await createSupabaseServer();

  // lấy product + join category/brand (do đã có FK)
  const { data: p, error } = await supabase
    .from("products")
    .select(`
      id, slug, name, price,code, description, packaging, packaging_override,
      package_type, pack_qty, unit, volume_ml,
      image_url, in_stock, is_active, category_id, brand_id,
      category:categories ( id, name, slug ),
      brand:brands ( id, name, slug )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) return <div className="p-6">Lỗi: {error.message}</div>;
  if (!p) return <div className="p-6">Không tìm thấy sản phẩm.</div>;

  const catRaw = (p as any).category;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;

  const brRaw = (p as any).brand;
  const br = Array.isArray(brRaw) ? brRaw[0] : brRaw;

  // Images theo schema của bạn
  const imgRes = await supabase
    .from("product_images")
    .select("id, public_url, alt, is_primary, sort_order, is_active")
    .eq("product_id", p.id)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  const images =
    imgRes.error || !imgRes.data?.length
      ? [{ id: "main", url: p.image_url ?? "https://placehold.co/900x900", alt: p.name, is_primary: true }]
      : imgRes.data.map((x: any) => ({
          id: x.id,
          url: x.public_url,
          alt: x.alt ?? p.name,
          is_primary: x.is_primary,
        }));

  // Related “các sản phẩm liên quan” = cùng category + brand (bạn đổi điều kiện nếu muốn)
 // Related theo category_id thôi
    const relRes = await supabase
      .from("products")
      .select("id, name, slug")
      .eq("is_active", true)
      .eq("category_id", p.category_id)
      .neq("id", p.id)
      .order("name")
      .limit(12);

    const relatedBase = relRes.data ?? [];
    const relIds = relatedBase.map((x: any) => x.id);

    const imgByProduct = new Map<string, string>();

    if (relIds.length > 0) {
      const relImgRes = await supabase
        .from("product_images")
        .select("product_id, public_url, is_primary, sort_order")
        .in("product_id", relIds)
        .eq("is_active", true)
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true });

      for (const row of relImgRes.data ?? []) {
        if (!imgByProduct.has(row.product_id)) imgByProduct.set(row.product_id, row.public_url);
      }
    }

    const related = relatedBase.map((x: any) => ({
      id: x.id,
      name: x.name,
      slug: x.slug,
      image_url: imgByProduct.get(x.id) ?? "https://placehold.co/200x200",
    }));

  return (
    <main className="min-h-screen bg-[#fbf7ea]">
      <div className="mx-auto max-w-6xl px-4 py-5">
        {/* Breadcrumb giống hình */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#0b2bbf]">
          <Link href="/" className="inline-flex items-center gap-2 hover:underline">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#0b2bbf]/20 bg-white/60">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 10v10h14V10" />
              </svg>
            </span>
          </Link>

          {/* <span className="opacity-50">›</span> */}
          {/* <Link href="/san-pham" className="hover:underline">
            Sản Phẩm
          </Link> */}
          {cat?.name ? (
            <>
            <span className="opacity-50">›</span>
            <Link href={`/san-pham/danh-muc/${cat.slug}`}>
              {cat.name}
            </Link>
            </>
          ) : null}

          <span className="opacity-50">›</span>
          <span className="font-semibold">{p.name}</span>
        </nav>

        <ProductDetailClient
          product={p}
          images={images}
          related={related}
          phone={SITE.phone}
          zalo={SITE.zalo}
        />
      </div>

    </main>
  );
}
