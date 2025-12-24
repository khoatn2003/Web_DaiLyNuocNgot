"use client";

import { useMemo, useState } from "react";
import { slugify } from "@/lib/admin-utils";
import { Trash2 } from "lucide-react";

type MetaItem = {
  id: string;
  name: string;
  slug: string;
  abbr: string | null;
};

function abbrify2(name: string) {
  const s = (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  return s.slice(0, 2).toUpperCase();
}

export default function MetaEditor({
  title,
  hint,
  onSave,
  onDelete,
  theme,
  items,
}: {
  title: string;
  hint: string;
  onSave: (v: { id?: string; name: string; slug: string; abbr: string }) => Promise<boolean>;
  onDelete: (id: string) =>  Promise<boolean>;
  theme: "dark" | "light";
  items: MetaItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [abbrTouched, setAbbrTouched] = useState(false);
  const computedSlug = useMemo(() => slugify(name.trim()), [name]);
  const suggestedAbbr = useMemo(() => abbrify2(name), [name]);

  const cls =
    theme === "dark"
      ? {
          card: "border-zinc-900 bg-zinc-900/40 text-zinc-100",
          hint: "text-zinc-400",
          input: "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500",
          btn: "bg-white text-zinc-950 hover:opacity-95",
          subtle: "text-zinc-400",
          list: "border-zinc-900 bg-zinc-950/40",
          row: "border-zinc-900 hover:bg-white/5",
          badge: "bg-white/10 text-zinc-200",
          danger: "text-red-300 hover:bg-red-500/10",
        }
      : {
          card: "border-gray-200 bg-white text-gray-900 shadow-sm",
          hint: "text-gray-600",
          input: "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
          btn: "bg-[#0213b0] text-white hover:opacity-95",
          subtle: "text-gray-500",
          list: "border-gray-200 bg-white",
          row: "border-gray-100 hover:bg-black/5",
          badge: "bg-black/5 text-gray-700",
          danger: "text-red-600 hover:bg-red-50",
        };

  
  function resetForm() {
    setEditingId(null);
    setName("");
    setAbbr("");
    setAbbrTouched(false);
  }

  function startCreate() {
    setEditingId(null);
    setName("");
    setAbbr("");
    setAbbrTouched(false);
  }

  function startEdit(it: MetaItem) {
    setEditingId(it.id);
    setName(it.name ?? "");
    setAbbr((it.abbr ?? "").toUpperCase());
    setAbbrTouched(true); // đã có giá trị => coi như user đã chạm
  }
 
  async function handleSave() {
    const success = await onSave({
      id : editingId ?? undefined,
      name : name.trim(),
      slug : computedSlug,
      abbr ,
    });

    if (success) resetForm();
  }
  async function handleDelete(id : string) {
    const ok = await onDelete(id);
    if (ok) resetForm();
  }
  return (
    <div className={`rounded-2xl border p-4 ${cls.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className={`text-sm mt-1 ${cls.hint}`}>{hint}</div>
          {editingId && (
            <div className={`mt-2 text-xs ${cls.subtle}`}>
              Đang sửa: <span className="font-medium">{name || "(chưa có tên)"}</span>
            </div>
          )}
        </div>

        {editingId && (
          <button
            type="button"
            onClick={startCreate}
            className={`rounded-xl px-3 py-2 text-sm ${cls.danger}`}
          >
            Hủy sửa
          </button>
        )}
      </div>

      {/* Form */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={`rounded-xl border p-2.5 outline-none ${cls.input}`}
          placeholder="Name"
          value={name}
          onChange={(e) => {
            const v = e.target.value;
            setName(v);
            if (!abbrTouched) setAbbr(abbrify2(v));
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
            Abbr dùng để sinh code (2 ký tự IN HOA). Slug tự sinh theo Name: <b>{computedSlug || "--"}</b>
          </div>
        </div>
      </div>

  <div className="mt-3 flex gap-2">
        <button onClick={handleSave} className={`rounded-xl px-4 py-2.5 font-medium ${cls.btn}`}>
          {editingId ? "Cập nhật" : "Lưu"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("Xóa mục này? Hành động không thể hoàn tác.")) return;
              handleDelete(editingId);
            }}
            className={`rounded-xl px-4 py-2.5 font-medium ${
              theme === "dark" ? "bg-red-500/15 text-red-200 hover:bg-red-500/25" : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            Xóa
          </button>
        )}

        <button
          type="button"
          onClick={resetForm}
          className={`rounded-xl px-4 py-2.5 font-medium ${
            theme === "dark" ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"
          }`}
        >
          Nhập mới
        </button>
      </div>

      {/* List */}
<div className={`mt-5 rounded-2xl border ${cls.list}`}>
        <div className={`px-4 py-3 text-sm font-semibold ${cls.subtle}`}>
          Danh sách ({items.length})
        </div>

        <div className="max-h-[360px] overflow-auto">
          {items.map((it) => (
            <div
              key={it.id}
              className={[
                "px-4 py-3 border-t flex items-center justify-between gap-3",
                cls.row,
                it.id === editingId ? (theme === "dark" ? "bg-white/5" : "bg-black/5") : "",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => {
                  setEditingId(it.id);
                  setName(it.name ?? "");
                  setAbbr((it.abbr ?? "").toUpperCase());
                  setAbbrTouched(true);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                <span
                  className={[
                    "shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold",
                    theme === "dark" ? "bg-white/10 text-zinc-200" : "bg-black/5 text-gray-700",
                  ].join(" ")}
                  title="Abbr"
                >
                  {it.abbr ?? "--"}
                </span>
              </div>
                <div className={`text-xs mt-0.5 ${cls.subtle} truncate`}>{it.slug}</div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!confirm(`Xóa "${it.name}"?`)) return;
                  handleDelete(it.id);
                }}
                className={`shrink-0 rounded-lg p-2 ${theme === "dark" ? "hover:bg-red-500/15 text-red-200" : "hover:bg-red-50 text-red-700"}`}
                aria-label="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
