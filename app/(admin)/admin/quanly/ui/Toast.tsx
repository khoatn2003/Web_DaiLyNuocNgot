"use client";

import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  subtitle?: string;
  duration?: number; // ms, 0 = không tự đóng
  onClose: () => void;
  className?: string;       // cls.toast
  buttonClassName?: string; // cls.toastBtn
  actionLabel?: string;     // "OK"
};

export default function Toast({
  message,
  subtitle,
  duration = 2600,
  onClose,
  className = "",
  buttonClassName = "",
  actionLabel = "OK",
}: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="pointer-events-none fixed left-1/2 z-[60] -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+16px)]">
      <div
        role="status"
        aria-live="polite"
        className={[
          "pointer-events-auto w-[min(92vw,420px)] overflow-hidden rounded-2xl border px-4 py-3 shadow-lg backdrop-blur",
          "animate-[toastIn_.18s_ease-out]",
          className,
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl opacity-80">
            {/* success icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="text-sm font-semibold leading-5">{message}</div>
            {subtitle ? <div className="mt-1 text-xs opacity-70">{subtitle}</div> : null}
          </div>

          <button
            onClick={onClose}
            className={["rounded-xl px-3 py-1.5 text-sm", buttonClassName].join(" ")}
          >
            {actionLabel}
          </button>

          <button
            onClick={onClose}
            className="ml-1 rounded-xl p-1 opacity-70 hover:opacity-100"
            aria-label="Đóng"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full w-full origin-left opacity-60 animate-[toastBar_linear_forwards] bg-current"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>

        <style jsx>{`
          @keyframes toastIn {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes toastBar {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
