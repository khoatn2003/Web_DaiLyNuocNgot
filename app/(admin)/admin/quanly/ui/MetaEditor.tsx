"use client";

import { useMemo, useState } from "react";
import { slugify } from "@/lib/admin-utils";

export function abbrify(name: string) {
  const s = (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ""); // bỏ space & ký tự đặc biệt

  return s.slice(0, 2).toUpperCase();
}


export default function MetaEditor({
  title,
  hint,
  onSave,
  theme,
}: {
  title: string;
  hint: string;
  onSave: (v: { name: string; slug: string; abbr: string }) => void | Promise<void>;
  theme: "dark" | "light";
}) {
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [abbrTouched, setAbbrTouched] = useState(false);

  const cls =
    theme === "dark"
      ? {
          card: "border-zinc-900 bg-zinc-900/40 text-zinc-100",
          hint: "text-zinc-400",
          input:
            "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500",
          btn: "bg-white text-zinc-950 hover:opacity-95",
          subtle: "text-zinc-400",
        }
      : {
          card: "border-gray-200 bg-white text-gray-900 shadow-sm",
          hint: "text-gray-600",
          input:
            "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
          btn: "bg-[#0213b0] text-white hover:opacity-95",
          subtle: "text-gray-500",
        };

  const computedSlug = useMemo(() => slugify(name), [name]);
  const suggestedAbbr = useMemo(() => abbrify(name), [name]);

  return (
    <div className={`rounded-2xl border p-4 ${cls.card}`}>
      <div className="text-lg font-semibold">{title}</div>
      <div className={`text-sm mt-1 ${cls.hint}`}>{hint}</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={`rounded-xl border p-2.5 outline-none ${cls.input}`}
          placeholder="Name"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);

            // Auto abbr nếu user chưa chỉnh tay
            if (!abbrTouched) setAbbr(abbrify(v));
          }}
        />

        <div className="space-y-1">
          <input
            className={`w-full rounded-xl border p-2.5 outline-none ${cls.input}`}
            placeholder={`Abbr (gợi ý: ${suggestedAbbr || "--"})`}
            value={abbr}
            onChange={(e) => {
              setAbbrTouched(true);
              setAbbr(e.target.value.toUpperCase().slice(0, 2));
            }}
          />
          <div className={`text-xs ${cls.subtle}`}>
            Abbr sẽ được dùng để sinh mã code (2 ký tự IN HOA).
          </div>
        </div>
      </div>

      {/* Slug chạy ngầm: không cho nhập, nếu muốn “debug” thì bạn có thể bật dòng dưới */}
      {/* <div className={`mt-2 text-xs ${cls.subtle}`}>Slug: {computedSlug}</div> */}

      <div className="mt-3">
        <button
          onClick={() => onSave({ name, slug: computedSlug, abbr })}
          className={`rounded-xl px-4 py-2.5 font-medium ${cls.btn}`}
        >
          Lưu
        </button>
      </div>
    </div>
  );
}
