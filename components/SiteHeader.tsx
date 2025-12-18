"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PhoneCall } from "lucide-react";

export default function SiteHeader({
  phone,
  zaloLink,
}: {
  phone: string;
  zaloLink: string;
}) {
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: "Trang chủ" },
    { href: "/san-pham", label: "Sản phẩm" },
    { href: "/gioi-thieu", label: "Giới thiệu" },
    { href: "/lien-he", label: "Liên hệ" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR (giống Vinamilk) */}
      <div className="bg-[#0213b0] text-white">
        <div className="mx-auto max-w-6xl px-4 h-10 flex items-center justify-between text-xs">
          <div className="truncate">
            Chất lượng và <b>Niềm tin</b>
          </div>

          <div className="hidden sm:flex items-center gap-5">
            <Link href="/gioi-thieu" className="hover:underline underline-offset-4">
              Luôn là đại lý mang lại tiềm tin tới khách hàng
            </Link>
            <Link href="/khuyen-mai" className="hover:underline underline-offset-4">
              Ưu đãi
            </Link>
            <Link href="/san-pham" className="hover:underline underline-offset-4">
              Cửa hàng
            </Link>

            <div className="flex items-center gap-3 pl-2">
              {/* icon search */}
              <button
                className="p-1.5 rounded hover:bg-white/10"
                aria-label="Tìm kiếm"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.5 19a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16.8 16.8 22 22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* icon cart (tuỳ chọn) */}
              <button
                className="relative p-1.5 rounded hover:bg-white/10"
                aria-label="Giỏ hàng"
                type="button"
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
                <span className="absolute -top-1 -right-1 text-[10px] min-w-[16px] h-4 px-1 rounded-full bg-white text-[#0213b0] flex items-center justify-center font-bold">
                  0
                </span>
              </button>

              <a
                href={`tel:${phone}`}
                className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20 transition"
                aria-label={`Gọi hotline ${phone}`}
              >
                <span className="phone-ring inline-flex">
                  <PhoneCall size={16} />
                </span>
                <span className="font-semibold tracking-tight">{phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className="bg-[#0213b0] text-white border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-extrabold tracking-wide">
            <Image
              src="/images/logo.png"
              alt="Logo Hoa Trường"
              width={48}
              height={48}
              className="shrink-0 rounded-md bg-white/10 p-1"
              priority
            />

            <span>ĐẠI LÝ NƯỚC NGỌT TIẾN MẠO</span>
          </Link>

          {/* Menu desktop */}
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="hover:opacity-90 hover:underline underline-offset-8"
              >
                {i.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${phone}`}
              className="hidden sm:inline-flex rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
            >
              Gọi ngay
            </a>
            <a
              href={zaloLink}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0213b0] hover:opacity-90"
            >
              Nhắn Zalo
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              aria-label="Mở menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
              {nav.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="py-2 text-sm hover:bg-white/10 rounded-lg px-2"
                  onClick={() => setOpen(false)}
                >
                  {i.label}
                </Link>
              ))}
              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${phone}`}
                  className="flex-1 rounded-lg border border-white/30 px-4 py-2 text-sm text-center hover:bg-white/10"
                >
                  Gọi ngay
                </a>
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg bg-white px-4 py-2 text-sm text-center font-semibold text-[#0213b0] hover:opacity-90"
                >
                  Zalo
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
