"use client";

import { SITE } from "@/lib/site";
import { Phone } from "lucide-react";
import { ZaloIcon } from "./icon/ZaloIcon";

export default function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <a  className="flex items-center gap-2 px-4 py-3 rounded-full border shadow bg-white"
           href={`tel:${SITE.phone}`}>
        <Phone size={18} />
        <span>Gọi ngay</span> 
      </a>

      <a
        href={`https://zalo.me/${SITE.zalo}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full border shadow bg-white"
      >
        <ZaloIcon size={18} />
        <span>Nhắn Zalo</span>
      </a>
    </div>
  );
}
