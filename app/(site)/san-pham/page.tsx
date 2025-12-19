import { createSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import SiteHeader from "@/components/SiteHeader";

export default async function ProductsPage() {
  const supabase = createSupabaseBrowser();
  noStore(); // để khách thấy cập nhật ngay
  const phone = "0377165869"; // đổi số của bạn   
 const zaloLink = `https://zalo.me/${phone}`;    
 
  const { data: products, error } = await supabase
    .from("products")
    .select("id,slug,name,brand,packaging,price,image_url")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) return <div>Lỗi tải sản phẩm: {error.message}</div>;

  return (
    <>
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sản phẩm</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {(products ?? []).map((p) => (
          <Link key={p.id} href={`/san-pham/${p.slug}`} className="border rounded-lg overflow-hidden hover:shadow">
            <img src={p.image_url ?? "https://placehold.co/800x600"} alt={p.name} className="w-full h-44 object-cover" />
            <div className="p-3">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">{p.packaging}</div>
              {p.price ? <div className="mt-2 font-medium">{p.price.toLocaleString("vi-VN")} đ</div> : <div className="mt-2 font-medium">Liên hệ</div>}
            </div>
          </Link>
        ))}
      </div>
    </main>
    </>
  );
}
