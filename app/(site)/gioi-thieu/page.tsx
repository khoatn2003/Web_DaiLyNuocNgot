

import { SITE } from "@/lib/site";
import Link from "next/link";

export const metadata = {
  title: "Giới thiệu | Đại lý Nước Ngọt Châu Khê",
  description:
    "Đại lý nước ngọt Châu Khê – Từ Sơn – Bắc Ninh. Cung cấp nước ngọt sỉ & lẻ, giao nhanh, giá tốt, hỗ trợ quán/đại lý.",
};
const yearsActive = new Date().getFullYear() - SITE.foundedYear;

function Card({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm ">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-[#0213b0]/10 p-2 text-[#0213b0]">
          {icon}
        </div>

        <div>
          <div className="font-semibold text-base text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600 leading-relaxed">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}


function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 text-center shadow-sm">
      <div className="text-2xl md:text-3xl font-extrabold text-[#0213b0]">
        {value}
      </div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default function AboutPage() {
  const zaloLink = `https://zalo.me/${SITE.zalo}`;

  return (
    <main className="bg-[#fbf7ea] border-y border-[#0b2bbf]/30">
      {/* Hero */}
      <section className="bg-[#0213b0] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-white" />
                {SITE.address}
              </div>
               <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-white" />
                {yearsActive > 0 ? `${yearsActive}+ năm hoạt động` : `Thành lập ${SITE.foundedYear}`}
              </div>

              <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
                {SITE.name}
              </h1>

              <p className="mt-3 text-white/85 leading-relaxed max-w-xl">
                Chuyên cung cấp nước ngọt, nước khoáng, nước tăng lực, sinh tố lúa mạch,... <b>sỉ & lẻ</b>.
                Ưu tiên giao nhanh – giá rõ ràng – hàng chuẩn nguồn.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/san-pham"
                  className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  Xem sản phẩm
                </Link>
              </div>
            </div>

            {/* Block hình minh hoạ */}
            <div className="rounded-3xl bg-white/10 p-5 border border-white/15">
              <div className="rounded-2xl bg-white/10 p-5">
                <div className="text-sm font-semibold">Cam kết của chúng tôi</div>
                <ul className="mt-3 space-y-2 text-sm text-white/85">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                    Hàng hoá rõ nguồn, nhập theo lô, dễ kiểm tra.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                    Báo giá nhanh, hỗ trợ khách lấy sỉ/quán ăn.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                    Giao linh hoạt theo khung giờ, ưu tiên gấp.
                  </li>
                </ul>

             <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-[#0213b0]">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0213b0]/10">
                {/* Icon điện thoại bàn */}
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                    d="M6 11c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    stroke="#0213b0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    />
                    <path
                    d="M5 11h3v4H5c-1 0-2-.8-2-2v0c0-1.2 1-2 2-2Z"
                    stroke="#0213b0"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    />
                    <path
                    d="M19 11h-3v4h3c1 0 2-.8 2-2v0c0-1.2-1-2-2-2Z"
                    stroke="#0213b0"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    />
                    <path
                    d="M8 19h8"
                    stroke="#0213b0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    />
                </svg>
                </div>

                <div>
                <div className="text-xs font-semibold uppercase">Hotline</div>
                <a className="text-lg font-extrabold" href={`tel:${SITE.phone}`}>
                    {SITE.phone}
                </a>
                </div>
            </div>
            </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Stat value="Sỉ & lẻ" label="Phục vụ đa nhu cầu" />
          <Stat value="Giao nhanh" label="Ưu tiên đơn gấp" />
          <Stat value="Giá rõ" label="Báo giá minh bạch" />
          <Stat value="Hỗ trợ" label="Quán/đại lý/CTY" />
          <Stat
            value={yearsActive > 0 ? `${yearsActive}+ năm` : `Từ ${SITE.foundedYear}`}
            label="Kinh nghiệm phục vụ"
          />
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Vì sao chọn chúng tôi?</h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Tối ưu cho khách mua nhanh: xem mẫu, hỏi giá, chốt đơn, giao hàng.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card
            title="Đa dạng sản phẩm"
            desc="Nước ngọt, sinh tố lúa mạch, tăng lực… cập nhật theo nhu cầu thị trường."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 7h10v14H7V7Z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
          <Card
            title="Giá tốt cho khách lấy sỉ"
            desc="Có mức giá phù hợp cho quán ăn, tạp hoá, đơn lấy số lượng."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1v22" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M17 5.5c0-2-2.2-3.5-5-3.5S7 3.5 7 5.5 9.2 9 12 9s5 1.5 5 3.5S14.8 16 12 16s-5-1.5-5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <Card
            title="Giao linh hoạt"
            desc="Hẹn giờ giao, gom đơn theo tuyến, ưu tiên đơn cần ngay."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h12" stroke="currentColor" strokeWidth="2" />
                <path d="M15 8h4l2 4v4h-6V8Z" stroke="currentColor" strokeWidth="2" />
                <path d="M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" />
                <path d="M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="2" />
              </svg>
            }
          />
          <Card
            title="Hỗ trợ nhanh qua Zalo"
            desc="Chốt đơn nhanh bằng ảnh/ghi chú: loại, số lượng, địa chỉ."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.5 8.5 0 1 1-4.2-7.3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M22 3 12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#fbf7ea] border-y border-[#0b2bbf]/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Quy trình đặt hàng
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Đơn giản, nhanh, đúng thứ bạn cần.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 ">
              <div className="text-xs font-semibold text-[#0213b0]">BƯỚC 1</div>
              <div className="mt-2 font-semibold text-slate-900">Chọn sản phẩm</div>
              <div className="mt-1 text-sm text-slate-600">
                Vào trang sản phẩm và chọn loại bạn cần.
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs font-semibold text-[#0213b0]">BƯỚC 2</div>
              <div className="mt-2 font-semibold text-slate-900">Gửi thông tin</div>
              <div className="mt-1 text-sm text-slate-600">
                Nhắn Zalo hoặc gọi: loại, số lượng, địa chỉ nhận.
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs font-semibold text-[#0213b0]">BƯỚC 3</div>
              <div className="mt-2 font-semibold text-slate-900">Giao hàng</div>
              <div className="mt-1 text-sm text-slate-600">
                Xác nhận đơn → giao đúng hẹn theo tuyến.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl bg-[#0213b0] p-6 md:p-10 text-white">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Cần báo giá sỉ / báo giá theo số lượng?
              </h2>
              <p className="mt-2 text-white/85">
                Nhắn Zalo để nhận báo giá nhanh theo mặt hàng & số lượng.
              </p>
            </div>
            <div className="flex flex-wrap md:justify-end gap-3">
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

      {/* Footer note */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="text-sm text-gray-600">
          Địa chỉ hoạt động: <b>{SITE.address}</b> • Hotline: <b>{SITE.phone}</b>
        </div>
      </section>
    </main>
  );
}
