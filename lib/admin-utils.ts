export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const PK_MAP: Record<string, string> = {
  thung: "thùng",
  loc: "lốc",
  day: "dây",
  ket: "két",
  hop: "hộp",
};
const UNIT_MAP: Record<string, string> = {
  lon: "lon",
  chai: "chai",
  hop: "hộp",
  goi: "gói",
};

export function formatPackaging(p: {
  packaging_override?: string | null;
  package_type?: string | null;
  pack_qty?: number | null;
  unit?: string | null;
  volume_ml?: number | null;
  packaging?: string | null; // fallback cũ
}) {
  if (p.packaging_override) return p.packaging_override;

  const ok =
    p.package_type && p.pack_qty && p.unit && p.volume_ml && p.pack_qty > 0 && p.volume_ml > 0;

  if (ok) {
    const pk = PK_MAP[p.package_type!] ?? p.package_type!;
    const unit = UNIT_MAP[p.unit!] ?? p.unit!;
    const vol = p.volume_ml! >= 1000 ? `${(p.volume_ml! / 1000).toString().replace(/\.0$/, "")}L` : `${p.volume_ml}ml`;
    return `1 ${pk} ${p.pack_qty} ${unit} ${vol}`;
  }

  return p.packaging ?? "";
}

export function formatBrand(b: {
  brand_name?: string | null; // join brands
  brand?: string | null;      // fallback cũ
}) {
  return b.brand_name ?? b.brand ?? "";
}
