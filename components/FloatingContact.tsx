"use client";

import { SITE } from "@/lib/site";

export default function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <a
        className="px-4 py-3 rounded-full shadow bg-white border"
        href={`tel:${SITE.phone}`}
      >
        📞 Gọi ngay
      </a>
      <a
        className="px-4 py-3 rounded-full shadow bg-white border"
        href={`https://zalo.me/${SITE.zalo}`}
        target="_blank"
        rel="noreferrer"
      >
        💬 Chat Zalo
      </a>
    </div>
  );
}
