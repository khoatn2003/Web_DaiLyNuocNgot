"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({
  basePath,
  current,
  value,
}: {
  basePath: string;
  current: Record<string, string>;
  value: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  return (
    <div className="rounded-lg border border-[#0b2bbf]/20 bg-white/60 px-3 py-2 text-sm font-semibold text-[#0b2bbf]">
      <label className="mr-2 opacity-70">Xếp theo:</label>
      <select
        value={value}
        onChange={(e) => {
          const usp = new URLSearchParams(sp.toString());
          usp.set("sort", e.target.value);
          usp.set("page", "1");
          router.push(`${basePath}?${usp.toString()}`);
        }}
        className="bg-transparent outline-none"
      >
        <option value="lien-quan">Liên quan</option>
        <option value="moi-nhat">Mới nhất</option>
        <option value="gia-tang">Giá tăng dần</option>
        <option value="gia-giam">Giá giảm dần</option>
      </select>
    </div>
  );
}
