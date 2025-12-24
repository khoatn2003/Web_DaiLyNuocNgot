import Link from "next/link";

type PageItem = number | "...";

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  pages.add(page);
  pages.add(page - 1);
  pages.add(page + 1);

  if (page <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const arr = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const out: PageItem[] = [];
  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    const prev = arr[i - 1];
    if (i > 0 && cur - prev > 1) out.push("...");
    out.push(cur);
  }
  return out;
}

export default function Pagination({
  page,
  totalPages,
  basePath,
  params,
  pageParam = "page",
  className = "",
}: {
  page: number;
  totalPages: number;
  basePath: string; // ví dụ "/san-pham"
  params?: Record<string, string | undefined>; // giữ search/cat/brand...
  pageParam?: string; // mặc định "page"
  className?: string;
}) {
  const items = getPageItems(page, totalPages);

  const makeHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) sp.set(k, v);
      });
    }
    sp.set(pageParam, String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const btnCls =
    "h-9 min-w-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-semibold transition";
  const numCls =
    "h-9 w-9 inline-flex items-center justify-center rounded-md text-sm font-semibold transition";

  if (totalPages <= 1) return null;

  return (
    <div className={`mt-8 flex items-center justify-center gap-2 ${className}`}>
      {/* Prev */}
      <Link
        href={makeHref(Math.max(1, page - 1))}
        aria-label="Trang trước"
        className={[
          btnCls,
          "text-slate-700 hover:bg-slate-100",
          page <= 1 ? "pointer-events-none opacity-40" : "",
        ].join(" ")}
      >
        <span className="text-lg leading-none">‹</span>
      </Link>

      {/* Numbers */}
      {items.map((it, idx) =>
        it === "..." ? (
          <span key={`d-${idx}`} className="px-2 text-slate-500 select-none">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={makeHref(it)}
            aria-current={it === page ? "page" : undefined}
            className={[
              numCls,
              it === page
                ? "border border-[#0b2bbf] text-[#0b2bbf] bg-white"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {it}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={makeHref(Math.min(totalPages, page + 1))}
        aria-label="Trang sau"
        className={[
          btnCls,
          "text-slate-700 hover:bg-slate-100",
          page >= totalPages ? "pointer-events-none opacity-40" : "",
        ].join(" ")}
      >
        <span className="text-lg leading-none">›</span>
      </Link>
    </div>
  );
}
