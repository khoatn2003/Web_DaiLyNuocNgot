import SiteHeader from "@/components/SiteHeader";
import { SITE } from "@/lib/site";
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

  return (
    <>
    {/* Header */}
    {/* <SiteHeader phone={phone} zaloLink={zaloLink} /> */}
    <main className="min-h-screen bg-white">
      {/* Banner */}
      <section className="relative w-full h-[260px] sm:h-[360px] md:h-[450px] lg:h-[520px]">
      {/* TỈ LỆ ẢNH BANNER 1920 X 600 */}
        <Image
          src="/images/banner4.png"
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
     {/* Products by Category (giống form Vinamilk) */}
      <section className="bg-[#fbf7ea] border-y border-[#0b2bbf]/30">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0b2bbf]">
                Sản phẩm theo danh mục
              </h2>
              <p className="mt-1 text-sm text-[#0b2bbf]/70">
                Chọn nhanh theo nhóm sản phẩm phổ biến.
              </p>
            </div>

            <Link
              href="/san-pham"
              className="text-sm font-semibold text-[#0b2bbf] hover:underline underline-offset-4"
            >
              Xem tất cả →
            </Link>
          </div>

          {/* Danh mục */}
         <div className="mt-10 space-y-12">
            <CategoryBlock
              title="Nước ngọt"
              href="/san-pham?cat=nuoc-ngot"
              products={[
                {
                  badge: "Bán chạy",
                  name: "Coca-Cola lon",
                  code: "S001",
                  sub: "Nước ngọt có gas",
                  desc:
                    "Hương vị quen thuộc, giao nhanh. Phù hợp mua theo thùng cho gia đình/quán.",
                  meta: "330ml, Thùng 24 lon",
                  img: "/images/banner.jpg",
                },
                {
                  badge: "Giá tốt",
                  name: "Pepsi lon",
                  code: "S001",
                  sub: "Nước ngọt có gas",
                  desc:
                    "Mát lạnh, đã khát. Thích hợp cho tiệc tùng, liên hoan, quán ăn.",
                  meta: "330ml, Thùng 24 lon",
                  img: "/images/products/biasaigon.jpg",
                },
                {
                  badge: "Ưa chuộng",
                  name: "7Up lon",
                  code: "S001",
                  sub: "Nước ngọt có gas",
                  desc:
                    "Vị chanh nhẹ, dễ uống. Hợp dùng kèm đồ ăn nhiều dầu mỡ.",
                  meta: "330ml, Thùng 24 lon",
                  img: "/images/products/coca-cola.png",
                },
              ]}
            />

            <CategoryBlock
              title="Nước suối"
              href="/san-pham?cat=nuoc-suoi"
              products={[
                {
                  badge: "Tinh khiết",
                  name: "Aquafina",
                  code: "S001",
                  sub: "Nước uống đóng chai",
                  desc:
                    "Nước tinh khiết, tiện mang đi. Phù hợp cho văn phòng và sự kiện.",
                  meta: "500ml, Thùng 24 chai",
                  img: "/images/banner4.png",
                },
                {
                  badge: "Phổ biến",
                  name: "Lavie",
                  code: "S001",
                  sub: "Nước khoáng",
                  desc:
                    "Nước khoáng thiên nhiên. Thích hợp dùng hằng ngày, giao nhanh.",
                  meta: "500ml, Thùng 24 chai",
                  img: "/images/banner4.png",
                },
                {
                  badge: "Tiện lợi",
                  name: "Nước suối 1.5L",
                  code: "S001",
                  sub: "Nước uống đóng chai",
                  desc:
                    "Dung tích lớn cho gia đình/quán. Giá tốt khi lấy theo thùng.",
                  meta: "1.5L, Thùng 12 chai",
                 img: "/images/banner4.png",
                },
              ]}
            />

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
    badge: string;
    name: string;
    code: string; // thêm mã
    sub: string;
    desc: string;
    meta: string;
    img: string;
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
          <ProductCard key={p.name} p={p} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  p,
}: {
  p: {
    badge: string;
    name: string;
    code: string; // thêm mã
    sub: string;
    desc: string;
    meta: string;
    img: string;
  };
}) {
  return (
    <div className="group relative h-full w-full border-b border-[#0b2bbf]/15 py-6 transition-all duration-300
                hover:-translate-y-1 hover:shadow-2xl">
      <div className="bg-[#fbf7ea] flex h-full flex-col rounded-2xl ring-1 ring-transparent
                group-hover:ring-[#0b2bbf]/20 transition overflow-hidden">
        {/* Badge */}
        <div className="w-full px-4">
          <div className="relative h-6">
            <div className="absolute left-0 top-0 z-[1] flex flex-col gap-1">
              <span className="w-fit rounded-md bg-white px-2 py-1 text-[11px] font-bold text-[#0b2bbf] ring-1 ring-[#0b2bbf]/15">
                {p.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Ảnh: aspect ratio giống Vinamilk */}
        <Link href="/san-pham" className="block text-[#0b2bbf]">
          <div className="relative overflow-hidden pt-[90%]">
            <Image
              src={p.img}
              alt={p.name}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.08]"
            />
          </div>
        </Link>

        {/* Nội dung */}
        <div className="flex grow flex-col px-4">
          <div className="mt-4 min-h-6 text-xs text-[#0b2bbf]/70">{p.sub}</div>

          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base md:text-lg font-extrabold tracking-tight text-[#0b2bbf]">
              {p.name}
            </h3>

            <button
              type="button"
              className="p-2 rounded-full hover:bg-[#0b2bbf]/10 text-[#0b2bbf]"
              aria-label="Mở tuỳ chọn"
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
            </button>
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
