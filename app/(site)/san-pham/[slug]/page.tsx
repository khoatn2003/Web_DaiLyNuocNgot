import { supabase } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import { unstable_noStore as noStore } from "next/cache";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  noStore();
  const { slug } = await params;
  const { data: p, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return <div>Lỗi: {error.message}</div>;
  if (!p) return <div>Không tìm thấy sản phẩm.</div>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <img src={p.image_url ?? "https://placehold.co/1000x700"} alt={p.name} className="w-full rounded-lg border" />
      <h1 className="text-2xl font-bold mt-4">{p.name}</h1>
      <div className="text-gray-700 mt-1">{p.packaging}</div>
      <div className="mt-2">{p.price ? <b>{p.price.toLocaleString("vi-VN")} đ</b> : <b>Liên hệ để báo giá</b>}</div>
      <p className="mt-4 whitespace-pre-line">{p.description}</p>

      <div className="mt-6 flex gap-3">
        <a className="px-4 py-2 rounded border" href={`tel:${SITE.phone}`}>📞 Gọi ngay</a>
        <a className="px-4 py-2 rounded border" href={`https://zalo.me/${SITE.zalo}`} target="_blank" rel="noreferrer">💬 Chat Zalo</a>
      </div>
    </main>
  );
}
