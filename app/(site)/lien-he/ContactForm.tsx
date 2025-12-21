"use client";

import { SITE } from "@/lib/site";

export default function ContactForm() {
  const zaloLink = `https://zalo.me/${SITE.zalo}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: sau này bạn nối Supabase insert tại đây
  }

  return (
  <div className="rounded-3xl border bg-white p-6 shadow-sm text-slate-900">
    <h2 className="text-xl font-bold text-slate-900">Gửi yêu cầu báo giá</h2>
    <p className="mt-1 text-sm text-slate-600">
      Điền nhanh thông tin, mình sẽ liên hệ lại sớm.
    </p>

    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-900">Họ tên</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0213b0]/20"
            placeholder="Ví dụ: Anh Nam"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900">Số điện thoại</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0213b0]/20"
            placeholder="09xxxxxxxx"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900">Địa chỉ giao</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0213b0]/20"
          placeholder="Từ Sơn, Bắc Ninh..."
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900">Nội dung</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0213b0]/20 min-h-[120px]"
          placeholder="Cần báo giá..."
        />
      </div>

      <button className="w-full rounded-xl bg-[#0213b0] px-4 py-3 text-sm font-semibold text-white hover:opacity-95">
        Gửi
      </button>

      <div className="pt-3 flex flex-col sm:flex-row gap-2">
        <a
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-center text-slate-900 hover:bg-slate-50"
          href={`tel:${SITE.phone}`}
        >
          Gọi ngay: {SITE.phone}
        </a>
        <a
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-center text-slate-900 hover:bg-slate-50"
          href={zaloLink}
          target="_blank"
          rel="noreferrer"
        >
          Chat Zalo
        </a>
      </div>
    </form>
  </div>
);

}
