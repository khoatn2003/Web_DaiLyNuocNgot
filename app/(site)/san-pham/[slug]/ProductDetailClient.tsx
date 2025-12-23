"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ClipboardCheck, Bike, Phone, MessageCircle, PackageX  } from "lucide-react";
import { formatPackaging } from "@/lib/admin-utils";
function formatVND(n?: number | null) {
  if (!n) return "";
  return n.toLocaleString("vi-VN") + "đ";
}

export default function ProductDetailClient({
  product,
  images,
  related,
  phone,
  zalo,
}: {
  product: any;
  images: { id: any; url: string; alt?: string }[];
  related: { id: any; name: string; slug: string; image_url: string }[];
  phone: string;
  zalo: string;
}) {
  // const [activeImg, setActiveImg] = useState(images?.[0]?.url ?? "https://placehold.co/900x900");

  //Xử lý gallery
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImg = images?.[activeIndex]?.url ?? "https://placehold.co/900x900";
  const [openZoom, setOpenZoom] = useState(false);

  const [touchX, setTouchX] = useState<number | null>(null);


  const goPrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % images.length);

  const priceText = product.price ? formatVND(product.price) : "Liên hệ";
  const packagingText = useMemo(
  () =>
    formatPackaging({
      packaging_override: product.packaging_override,
      package_type: product.package_type,
      pack_qty: product.pack_qty,
      unit: product.unit,
      volume_ml: product.volume_ml,
      packaging: product.packaging,
    }),
  [
    product.packaging_override,
    product.package_type,
    product.pack_qty,
    product.unit,
    product.volume_ml,
    product.packaging,
  ]
);

useEffect(() => {
  if (!openZoom) return;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpenZoom(false);
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [openZoom, goPrev, goNext]);


const onTouchStart = (e: React.TouchEvent) => {
  setTouchX(e.touches[0].clientX);
};

const onTouchEnd = (e: React.TouchEvent) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  setTouchX(null);

  if (Math.abs(dx) < 40) return;
  if (dx > 0) goPrev();
  else goNext();
};

  // ví dụ hiển thị “200g” nếu trong packaging có
  const weightLabel = useMemo(() => {
    const s = `${product.packaging_override ?? ""} ${product.packaging ?? ""}`.trim();
    const m = s.match(/(\d+\s?g|\d+\s?kg)/i);
    return m?.[1] ?? "";
  }, [product.packaging, product.packaging_override]);

  return (
    <>
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_1fr]">
      {/* LEFT: Gallery */}
      <section className="flex gap-5">
        {/* thumbs desktop */}
        <div className="hidden lg:flex lg:flex-col lg:gap-3">
          {/* {images.slice(0, 6).map((im) => {
            const isActive = im.url === activeImg;
            return (
              <button
                key={String(im.id)}
                onClick={() => setActiveImg(im.url)}
                className={[
                  "h-14 w-14 overflow-hidden rounded-lg border bg-white/70",
                  isActive
                    ? "border-[#0b2bbf] ring-2 ring-[#0b2bbf]/30"
                    : "border-[#0b2bbf]/15 hover:border-[#0b2bbf]/40",
                ].join(" ")}
              >
                <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-contain p-1" />
              </button>
            );
          })} */}
          {images.slice(0, 6).map((im, idx) => {
              const realIdx = idx; // vì slice từ 0
              const isActive = realIdx === activeIndex;
              return (
                <button
                  key={String(im.id)}
                  onClick={() => setActiveIndex(realIdx)}
                  className={[
                    "h-14 w-14 overflow-hidden rounded-lg border bg-white/70",
                    isActive ? "border-[#0b2bbf] ring-2 ring-[#0b2bbf]/30" : "border-[#0b2bbf]/15 hover:border-[#0b2bbf]/40",
                  ].join(" ")}
                >
                  <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-contain p-1" />
                </button>
              );
            })}
        </div>

        {/* main image */}
        <div className="flex-1">
          <div className="group relative mx-auto flex max-w-[520px] items-center justify-center"
           style={{ touchAction: "pan-y" }}
           onTouchStart={onTouchStart}
           onTouchEnd={onTouchEnd}>
          <button
            type="button"
            onClick={() => setOpenZoom(true)}
            className="relative w-full"
            aria-label="Phóng to ảnh"
          >
            <img
              src={activeImg}
              alt={product.name}
              className="w-full max-h-[520px] object-contain"
            />
          </button>

        {/* Hover controls */}
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 hidden h-10 w-10 items-center justify-center rounded-full border border-[#0b2bbf]/20 bg-white/80 text-[#0b2bbf] shadow-sm backdrop-blur transition hover:bg-white group-hover:flex"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden h-10 w-10 items-center justify-center rounded-full border border-[#0b2bbf]/20 bg-white/80 text-[#0b2bbf] shadow-sm backdrop-blur transition hover:bg-white group-hover:flex"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => setOpenZoom(true)}
          className="absolute left-2 top-2 hidden items-center gap-2 rounded-full border border-[#0b2bbf]/20 bg-white/80 px-3 py-2 text-sm font-semibold text-[#0b2bbf] shadow-sm backdrop-blur transition hover:bg-white group-hover:flex"
          aria-label="Phóng to"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>

          {/* thumbs mobile */}
          <div className="mt-4 flex gap-3 overflow-auto lg:hidden">
            {/* {images.slice(0, 8).map((im) => {
              const isActive = im.url === activeImg;
              return (
                <button
                  key={String(im.id)}
                  onClick={() => setActiveImg(im.url)}
                  className={[
                    "shrink-0 h-14 w-14 overflow-hidden rounded-lg border bg-white/70",
                    isActive ? "border-[#0b2bbf] ring-2 ring-[#0b2bbf]/30" : "border-[#0b2bbf]/15",
                  ].join(" ")}
                >
                  <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-contain p-1" />
                </button>
              );
            })} */}
            {images.slice(0, 8).map((im, idx) => {
              const realIdx = idx;
              const isActive = realIdx === activeIndex;
              return (
                <button
                  key={String(im.id)}
                  onClick={() => setActiveIndex(realIdx)}
                  className={[
                    "shrink-0 h-14 w-14 overflow-hidden rounded-lg border bg-white/70",
                    isActive ? "border-[#0b2bbf] ring-2 ring-[#0b2bbf]/30" : "border-[#0b2bbf]/15",
                  ].join(" ")}
                >
                  <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-contain p-1" />
                </button>
              );
            })}

          </div>
        </div>
      </section>

      {/* RIGHT: Info */}
      <section>
        {product.category?.name ? (
          <div className="text-sm font-semibold text-[#0b2bbf]">
            {product.category.name}
          </div>
        ) : null}

        <h1 className="mt-2 flex flex-wrap items-center gap-3 text-4xl font-extrabold tracking-tight text-[#0b2bbf]">
          <span>{product.name}</span>

          {product.code ? (
            <span className="inline-flex items-center rounded-full border border-[#0b2bbf]/20 bg-white/70 px-3 py-1 text-base font-semibold text-[#0b2bbf]">
              <span className="opacity-70 mr-1">Mã:</span>
              {product.code}
            </span>
          ) : null}
        </h1>

        {/* row giao hàng */}
        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Chốt đơn
            </span>

            <span className="inline-flex items-center gap-2">
            <Bike className="h-4 w-4" />
            Ship ngay
          </span>
        </div>

        {/* mô tả */}
        {product.description ? (
          <p className="mt-5 leading-7 text-[#0b2bbf] whitespace-pre-line">
            {product.description}
          </p>
        ) : null}

        {/* Grid “các vị” */}
        {/* {related.length > 0 ? (
          <div className="mt-7">
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
              {/* item hiện tại */}
              {/* <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-[#0b2bbf]/25 bg-blue-50/80">
                  <img
                    src={product.image_url ?? images?.[0]?.url ?? "https://placehold.co/200x200"}
                    alt={product.name}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="mt-2 text-sm font-semibold text-[#0b2bbf]">
                  {product.name}
                </div>
              </div>

              {related.map((it) => (
                <Link key={String(it.id)} href={`/san-pham/${it.slug}`} className="group text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-transparent bg-white/60 group-hover:border-[#0b2bbf]/20">
                    <img src={it.image_url} alt={it.name} className="h-12 w-12 object-contain" />
                  </div>
                  <div className="mt-2 text-sm text-[#0b2bbf]">{it.name}</div>
                </Link>
              ))}
            </div>

            <div className="mt-4 h-[2px] w-full bg-[#0b2bbf]" />
          </div>
        ) : null} */}

        {/* Weight tab + option + price */}
        <div className="mt-8">
          <div className="inline-flex min-w-[140px] items-center justify-center border-b-2 border-[#0b2bbf] bg-blue-50/70 px-6 py-2 font-semibold text-[#0b2bbf]">
             <span>{packagingText || "Chưa cập nhật đóng gói"}</span>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#0b2bbf]/10 pt-5">
            <label className="inline-flex items-center gap-2 text-sm text-[#0b2bbf]">
              <span>{"Thương hiệu: " + product.brand?.name}</span>
            </label>

            <div className="text-right text-lg font-extrabold text-[#0b2bbf]">
              {priceText}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
          {/* Gọi ngay */}
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0b2bbf]/20 bg-white/70 px-4 py-2 text-sm font-semibold text-[#0b2bbf] hover:bg-white"
          >
            <Phone className="h-4 w-4" />
            Gọi ngay
          </a>

          {/* Chat Zalo */}
          <a
            href={`https://zalo.me/${zalo}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0b2bbf]/20 bg-white/70 px-4 py-2 text-sm font-semibold text-[#0b2bbf] hover:bg-white"
          >
            <MessageCircle className="h-4 w-4" />
            Chat Zalo
          </a>

          {/* Hết hàng */}
          {!product.in_stock && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700">
              <PackageX className="h-4 w-4" />
              Hết hàng
            </span>
          )}
        </div>

       </div>
      </section>
    </div>
    
    {/* Sản phẩm liên quan */}
{related.length > 0 ? (
  <section className="mt-12">
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h5 className="text-2xl font-extrabold text-[#0b2bbf]">Sản phẩm liên quan</h5>
        <p className="mt-1 text-sm text-[#0b2bbf]/70">
          Gợi ý một số sản phẩm có thể quý khách cần
        </p>
      </div>

      <Link
        href="/san-pham"
        className="text-sm font-semibold text-[#0b2bbf] hover:underline"
      >
        Xem tất cả
      </Link>
    </div>

    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {related.map((it) => (
        <Link
          key={String(it.id)}
          href={`/san-pham/${it.slug}`}
          className="group rounded-2xl border border-[#0b2bbf]/10 bg-white/70 p-3 shadow-sm hover:border-[#0b2bbf]/25 hover:bg-white"
        >
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-white">
            <img
              src={it.image_url}
              alt={it.name}
              className="h-full w-full object-contain p-3 transition-transform group-hover:scale-[1.02]"
            />
          </div>

          <div className="mt-3">
            <div className="line-clamp-2 text-sm font-semibold text-[#0b2bbf]">
              {it.name}
            </div>
            <div className="mt-1 text-xs text-[#0b2bbf]/60">
              Xem chi tiết →
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
) : null}

{openZoom ? (
  <div
    className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm"
    onClick={() => setOpenZoom(false)}
  >
    <div
      className="absolute inset-0 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        type="button"
        onClick={() => setOpenZoom(false)}
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Prev/Next */}
      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
            aria-label="Ảnh sau"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      {/* Image */}
      <img
        src={activeImg}
        alt={product.name}
        className="max-h-[85vh] w-auto max-w-[92vw] object-contain"
      />

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white">
        {activeIndex + 1}/{images.length}
      </div>
    </div>
  </div>
) : null}

</>

  );
}
