import Link from "next/link";

export default function HomePage() {
  const phone = "0987654321"; // đổi số của bạn
  const zaloLink = `https://zalo.me/${phone}`;

  const products = [
    { name: "Coca-Cola", price: "10.000đ / lon", note: "Mát lạnh, dễ bán" },
    { name: "Pepsi", price: "10.000đ / lon", note: "Hàng phổ biến" },
    { name: "Sting Dâu", price: "11.000đ / chai", note: "Năng lượng" },
    { name: "Aquafina", price: "6.000đ / chai", note: "Nước suối" },
  ];
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-lg">Đại lý Nước Ngọt Châu Khê</div>
           <h1>Trang chủ</h1>
            <Link href="/san-pham">Xem sản phẩm</Link>
          <div className="flex gap-2">
            <a
              href={`tel:${phone}`}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Gọi ngay
            </a>
            
            <a
              href={zaloLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Chat Zalo
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">
          Nước ngọt sỉ & lẻ – giao nhanh khu vực Từ Sơn, Bắc Ninh
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          Chuyên các loại nước ngọt, nước suối, nước tăng lực. Khách cần mua liên
          hệ qua điện thoại hoặc Zalo để chốt đơn nhanh.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`tel:${phone}`}
            className="rounded-xl bg-black px-5 py-3 text-white hover:opacity-90"
          >
            Gọi đặt hàng
          </a>
          <a
            href={zaloLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border px-5 py-3 hover:bg-gray-50"
          >
            Nhắn Zalo
          </a>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
          Địa chỉ: Châu Khê – Từ Sơn – Bắc Ninh • Hotline/Zalo: {phone}
        </div>
      </footer>
    </main>
  );
}
