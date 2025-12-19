"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BannerSlider() {
  const banners = ["/images/banner/bannernha.jpg", "/images/banner/bannergd.jpg", "/images/banner/banner6.png", "/images/banner/bannergiangsinh.png"];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <section className="relative w-full h-[260px] sm:h-[360px] md:h-[450px] lg:h-[520px] overflow-hidden">
      {/* Slides (fade) */}
      {banners.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Banner"
          fill
          priority={i === 0}
          sizes="100vw"
          className={[
            "object-cover transition-opacity duration-700",
            i === idx ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/25" />
      {/* Content: mobile đỡ chật -> đẩy xuống + khung mờ */}
      <div className="absolute inset-0 flex items-end sm:items-center justify-center text-center p-4 sm:p-0">
        <div className="max-w-3xl text-white w-full sm:w-auto">
         <div className="mx-auto rounded-2xl bg-black/10 backdrop-blur-sm px-4 py-4
                        sm:bg-transparent sm:backdrop-blur-0 sm:px-6 sm:py-5">

            <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-snug md:leading-tight">
              Nước ngọt sỉ & lẻ – giao nhanh khu vực Từ Sơn, Bắc Ninh
            </h1>

            <p className="mt-3 text-xs sm:text-sm md:text-lg opacity-90 leading-relaxed">
              Chuyên các loại nước ngọt, nước suối, nước tăng lực,.. Khách cần mua liên hệ qua
              điện thoại hoặc Zalo để chốt đơn nhanh cho em nha.
            </p>

            <Link
              href="/san-pham"
              className="mt-4 sm:mt-6 inline-flex items-center justify-center rounded-full bg-white/95 text-black px-6 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base font-semibold shadow hover:bg-white transition"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>

      {/* Thanh ngang (luôn nằm đáy banner, mọi màn hình) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Chuyển banner ${i + 1}`}
            type="button"
            className={[
              "h-1.5 rounded-full transition-all",
              i === idx ? "w-10 bg-white" : "w-6 bg-white/45 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
