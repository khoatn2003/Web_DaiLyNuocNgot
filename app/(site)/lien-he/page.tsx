import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Liên hệ | Đại lý Nước Ngọt Châu Khê",
  description:
    "Liên hệ Đại lý Nước Ngọt Châu Khê – Từ Sơn – Bắc Ninh. Gọi hotline hoặc nhắn Zalo để báo giá sỉ/lẻ và đặt hàng nhanh.",
};

function InfoCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow transition">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-[#0213b0]/10 p-2 text-[#0213b0]">
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-gray-500">{title}</div>
          <div className="mt-1 font-semibold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {content}
    </a>
  ) : (
    content
  );
}

export default function ContactPage() {
  const zaloLink = `https://zalo.me/${SITE.zalo}`;

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-[#0213b0] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex flex-col gap-3">
            <div className="text-white/85 text-sm">
              <Link href="/" className="hover:underline underline-offset-4">
                Trang chủ
              </Link>{" "}
              <span className="text-white/60">/</span>{" "}
              <span className="font-semibold">Liên hệ</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold">
              Liên hệ {SITE.name}
            </h1>

            <p className="text-white/85 max-w-2xl leading-relaxed">
              Cần báo giá sỉ/lẻ, đặt hàng nhanh hoặc tư vấn theo số lượng?
              Gọi hotline hoặc nhắn Zalo, mình phản hồi nhanh.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${SITE.phone}`}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0213b0] hover:opacity-90"
              >
                Gọi ngay
              </a>
              <a
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10"
              >
                Chat Zalo
              </a>
              <Link
                href="/san-pham"
                className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10"
              >
                Xem sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-4">
            {/* ... giữ nguyên các InfoCard của bạn ... */}
            <InfoCard
              title="Hotline"
              value={SITE.phone}
              href={`tel:${SITE.phone}`}
              icon={<span className="font-bold">☎</span>}
            />
            {/* các InfoCard khác */}
          </div>

          {/* Right: Form (Client Component) */}
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
