"use client";

import { Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { ZaloIcon } from "./icon/ZaloIcon";

export default function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {/* Gọi */}
      <a
        href={`tel:${SITE.phone}`}
        className="group relative h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl hover:ring-4 hover:ring-black/5 transition"
        aria-label="Gọi ngay"
      >
        <Phone size={20} className="text-black" />
        <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs text-white opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition hidden md:block">
          Gọi ngay
        </span>
      </a>

      {/* Zalo */}
      <a
        href={`https://zalo.me/${SITE.zalo}`}
        target="_blank"
        rel="noreferrer"
        className="group relative h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl hover:ring-4 hover:ring-black/5 transition"
        aria-label="Nhắn Zalo"
      >
        <ZaloIcon size={20} className="text-blue-600" />
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs text-white opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition hidden md:block">
          Nhắn Zalo
        </span>
      </a>
    </div>
  );
}
