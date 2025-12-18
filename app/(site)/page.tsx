import SiteHeader from "@/components/SiteHeader";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const phone = "0377165869"; // đổi số của bạn
  const zaloLink = `https://zalo.me/${phone}`;

  const products = [
    { name: "Coca-Cola", price: "10.000đ / lon", note: "Mát lạnh, dễ bán" },
    { name: "Pepsi", price: "10.000đ / lon", note: "Hàng phổ biến" },
    { name: "Sting Dâu", price: "11.000đ / chai", note: "Năng lượng" },
    { name: "Aquafina", price: "6.000đ / chai", note: "Nước suối" },
  ];
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <>
    {/* Header */}
    {/* <SiteHeader phone={phone} zaloLink={zaloLink} /> */}
    <main className="min-h-screen bg-white">
      {/* Banner */}
 <section className="relative w-full h-[260px] sm:h-[360px] md:h-[450px] lg:h-[520px]">
      {/* TỈ LỆ ẢNH BANNER 1920 X 600 */}
        <Image
          src="/images/banner2.png"
          alt="Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* (Tuỳ chọn) overlay chữ + nút */}
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="px-4 text-white max-w-3xl">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Nước ngọt sỉ & lẻ – giao nhanh khu vực Từ Sơn, Bắc Ninh
            </h1>

            <p className="mt-4 text-sm md:text-lg opacity-90 leading-relaxed">
              Chuyên các loại nước ngọt, nước suối, nước tăng lực,.. Khách cần mua liên hệ qua
              điện thoại hoặc Zalo để chốt đơn nhanh cho em nha.
            </p>

            <Link
              href="/san-pham"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white/95 text-black px-7 py-3 font-semibold shadow hover:bg-white transition"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>

      </section>
      {/* Hero */} 
      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">Sản phẩm nổi bật</h2>
          <p className="text-sm text-gray-500">Giá tham khảo – liên hệ để báo sỉ</p>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border p-4 hover:shadow-sm transition"
            >
              <div className="h-32 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                Ảnh sản phẩm
              </div>
              <div className="mt-3 font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">{p.price}</div>
              <div className="mt-2 text-xs text-gray-500">{p.note}</div>

              <div className="mt-4 flex gap-2">
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl bg-black px-3 py-2 text-center text-sm text-white hover:opacity-90"
                >
                  Hỏi giá
                </a>
                <a
                  href={`tel:${phone}`}
                  className="flex-1 rounded-xl border px-3 py-2 text-center text-sm hover:bg-gray-50"
                >
                  Gọi
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
    </>
  );
}
