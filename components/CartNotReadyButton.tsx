"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function CartNotReadyButton({
  disabled,
  productName,
}: {
  disabled: boolean;
  productName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
        }}
        className={[
          "p-2 rounded-full text-[#0b2bbf] transition",
          disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[#0b2bbf]/10",
        ].join(" ")}
        aria-label={disabled ? "Hết hàng" : "Thêm vào giỏ"}
        title={disabled ? "Hết hàng" : "Thêm vào giỏ"}
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
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[9999]">
              {/* overlay */}
              <button
                type="button"
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
              />

              {/* modal */}
              <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10 text-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#0b2bbf]">
                      Xin lỗi bạn 😥
                    </div>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                      Hiện tại shop chưa triển khai tính năng giỏ hàng.
                      {productName ? (
                        <>
                          {" "}
                          Bạn đang chọn: <b>{productName}</b>.
                        </>
                      ) : null}{" "}
                      Bạn vui lòng nhắn Zalo hoặc gọi để mình báo giá và chốt đơn nhanh nhé!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Đóng"
                    title="Đóng"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6 6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl bg-[#0b2bbf] px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                  >
                    OK, mình hiểu
                  </button>
                </div>

                <div className="mt-3 text-[12px] text-slate-500">
                  (Nhấn ESC để đóng)
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
