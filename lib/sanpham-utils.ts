export function normalizeSearchParams(sp: any) {
  const out: Record<string, string> = {};
  if (!sp) return out;
  for (const k of Object.keys(sp)) {
    const v = sp[k];
    out[k] = Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  }
  return out;
}

export function pickPrimaryImage(images: any[] | null | undefined) {
  const list = (images ?? []).filter((x) => x?.is_active !== false);
  list.sort((a, b) => {
    const ap = a?.is_primary ? 1 : 0;
    const bp = b?.is_primary ? 1 : 0;
    if (bp !== ap) return bp - ap;
    return (a?.sort_order ?? 0) - (b?.sort_order ?? 0);
  });
  // ✅ placeholder thống nhất
  return list[0]?.public_url ?? "/images/products/placeholder.png";
}

export function getOne<T>(x: T | T[] | null | undefined): T | null {
  if (!x) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}
