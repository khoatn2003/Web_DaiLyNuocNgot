"use client";

import { SITE } from "@/lib/site";

export default function ContactForm() {
  const zaloLink = `https://zalo.me/${SITE.zalo}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: sau này bạn nối Supabase insert tại đây
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Gửi yêu cầu báo giá</h2>
      <p className="mt-1 text-sm text-gray-600">
        Điền nhanh thông tin, mình sẽ liên hệ lại sớm.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Họ tên</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Ví dụ: Anh Nam" />
          </div>
          <div>
            <label className="text-sm font-semibold">Số điện thoại</label>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="09xxxxxxxx" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Địa chỉ giao</label>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Từ Sơn, Bắc Ninh..." />
        </div>

        <div>
          <label className="text-sm font-semibold">Nội dung</label>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[120px]" placeholder="Cần báo giá..." />
        </div>

        <button className="w-full rounded-xl bg-[#0213b0] px-4 py-3 text-sm font-semibold text-white">
          Gửi
        </button>

        <div className="pt-3 flex flex-col sm:flex-row gap-2">
          <a className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold text-center hover:bg-gray-50" href={`tel:${SITE.phone}`}>
            Gọi ngay: {SITE.phone}
          </a>
          <a className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold text-center hover:bg-gray-50" href={zaloLink} target="_blank" rel="noreferrer">
            Chat Zalo
          </a>
        </div>
      </form>
    </div>
  );
}
