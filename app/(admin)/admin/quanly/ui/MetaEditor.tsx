"use client";

import { useState } from "react";
import { slugify } from "@/lib/admin-utils";

export default function MetaEditor({
  title,
  hint,
  onSave,
}: {
  title: string;
  hint: string;
  onSave: (row: { name: string; slug: string; abbr: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [abbr, setAbbr] = useState("");

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-4">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-sm text-zinc-400 mt-1">{hint}</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 outline-none"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 outline-none"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 outline-none"
          placeholder="Abbr (2 chữ in hoa)"
          value={abbr}
          onChange={(e) => setAbbr(e.target.value.toUpperCase().slice(0, 2))}
        />
      </div>

      <div className="mt-3">
        <button
          onClick={() => onSave({ name, slug: slug || slugify(name), abbr })}
          className="rounded-xl bg-white text-zinc-950 px-4 py-2.5 font-medium"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}
