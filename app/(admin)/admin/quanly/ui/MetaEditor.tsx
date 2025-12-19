"use client";

import { useState } from "react";
import { slugify } from "@/lib/admin-utils";

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
  const [slug, setSlug] = useState("");
  const [abbr, setAbbr] = useState("");

  const cls =
  theme === "dark"
    ? {
        card: "border-zinc-900 bg-zinc-900/40 text-zinc-100",
        hint: "text-zinc-400",
        input: "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500",
        btn: "bg-white text-zinc-950 hover:opacity-95",
      }
    : {
        card: "border-gray-200 bg-white text-gray-900 shadow-sm",
        hint: "text-gray-600",
        input: "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
        btn: "bg-[#0213b0] text-white hover:opacity-95",
      };

return (
  <div className={`rounded-2xl border p-4 ${cls.card}`}>
    <div className="text-lg font-semibold">{title}</div>
    <div className={`text-sm mt-1 ${cls.hint}`}>{hint}</div>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <input
        className={`rounded-xl border p-2.5 outline-none ${cls.input}`}
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className={`rounded-xl border p-2.5 outline-none ${cls.input}`}
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <input
        className={`rounded-xl border p-2.5 outline-none ${cls.input}`}
        placeholder="Abbr (2 chữ in hoa)"
        value={abbr}
        onChange={(e) => setAbbr(e.target.value.toUpperCase().slice(0, 2))}
      />
    </div>

    <div className="mt-3">
      <button
        onClick={() => onSave({ name, slug: slug || slugify(name), abbr })}
        className={`rounded-xl px-4 py-2.5 font-medium ${cls.btn}`}
      >
        Lưu
      </button>
    </div>
  </div>
);

}
