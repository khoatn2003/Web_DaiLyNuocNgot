import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

type FooterProps = {
  address: string;
  hotline: string;
  fanpageUrl?: string;
  bank: {
    owner: string;
    accountNumber: string;
    bankName: string;
  };
};

export default function SiteFooter({
  address,
  hotline,
  fanpageUrl,
  bank,
}: FooterProps) {
  return (
    <footer className="bg-[#123843] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Cột 1: Địa chỉ + Hotline */}
          <div className="space-y-6">
            <div className="flex gap-3">
              <MapPin className="mt-1 shrink-0 opacity-90" size={18} />
              <div>
                <p className="font-semibold">Địa chỉ:</p>
                <p className="mt-1 text-white/85 leading-relaxed">{address}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="mt-1 shrink-0 opacity-90" size={18} />
              <div>
                <p className="font-semibold">Hotline:</p>
                <a
                  href={`tel:${hotline.replace(/\s/g, "")}`}
                  className="mt-1 inline-block text-2xl font-extrabold tracking-tight hover:opacity-90"
                >
                  {hotline}
                </a>
              </div>
            </div>
          </div>

          {/* Cột 2: Fanpage */}
          <div className="space-y-4">
            <p className="font-semibold">Fanpage</p>

            {fanpageUrl ? (
              <Link
                href={fanpageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-white/85 hover:text-white"
              >
                Xem Fanpage
                <span aria-hidden className="text-white/60">→</span>
              </Link>
            ) : (
              <p className="text-white/70">
                (Bạn thêm link fanpage để hiện ở đây)
              </p>
            )}

            {/* Nếu muốn nhúng Facebook Page Plugin thì mình sẽ đưa đoạn iframe chuẩn theo link fanpage của bạn */}
          </div>

          {/* Cột 3: Ngân hàng + Logo */}
          <div className="space-y-4">
            <p className="font-semibold">Tài khoản ngân hàng:</p>

            <div className="space-y-2 text-white/85">
              <p>
                Chủ tài khoản: <span className="text-white">{bank.owner}</span>
              </p>
              <p>
                Số TK: <span className="text-white">{bank.accountNumber}</span>
              </p>
              <p>
                Ngân hàng: <span className="text-white">{bank.bankName}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {/* Bạn đặt ảnh logo vào /public/images/payments/... */}
              <Image
                src="/images/payments/mbbank.jpg"
                alt="MBBank"
                width={44}
                height={44}
                className="h-10 w-auto rounded bg-white p-1"
              />
              <Image
                src="/images/payments/momo.png"
                alt="MoMo"
                width={44}
                height={44}
                className="h-10 w-auto rounded bg-white p-1"
              />
              <Image
                src="/images/payments/zalopay.jpg"
                alt="ZaloPay"
                width={44}
                height={44}
                className="h-10 w-auto rounded bg-white p-1"
              />
            </div>

            <p className="pt-2 text-white/80 leading-relaxed">
              Quý khách chuyển nhanh (Napas 24/7) để tiền đi nhanh, có tên người
              nhận, và không cần chọn chi nhánh ngân hàng.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/70">
          © {new Date().getFullYear()} Công ty TNHH Thương Mại Dịch Vụ Tiến Mạo. All rights
        </div>
      </div>
    </footer>
  );
}
