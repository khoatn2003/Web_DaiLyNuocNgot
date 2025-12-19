"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { formatBrand, formatPackaging, slugify } from "@/lib/admin-utils";
import MetaEditor from "./ui/MetaEditor";
import type { Category, Brand, ProductRow, ImgRow } from "./type";
import { useMeta } from "./hook/useMeta";
// type Category = { id: string; name: string; slug: string; abbr: string | null };
// type Brand    = { id: string; name: string; slug: string; abbr: string | null };

const PK_OPTIONS = [
  { value: "", label: "—" },
  { value: "thung", label: "Thùng" },
  { value: "loc", label: "Lốc" },
  { value: "day", label: "Dây" },
  { value: "ket", label: "Két" },
  { value: "hop", label: "Hộp" },
];
const UNIT_OPTIONS = [
  { value: "", label: "—" },
  { value: "lon", label: "Lon" },
  { value: "chai", label: "Chai" },
  { value: "hop", label: "Hộp" },
  { value: "goi", label: "Gói" },
];

export default function AdminClient({ email }: { email: string }) {
  const supabase = createSupabaseBrowser();
  const router = useRouter();

  const [tab, setTab] = useState<"products" | "categories" | "brands">("products");
  const [items, setItems] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  // Images
  const [imgs, setImgs] = useState<ImgRow[]>([]);
  const [imgBusy, setImgBusy] = useState(false);
  const { cats, brs, loadMeta, upsertCategory, upsertBrand } =
  useMeta(supabase, (m) => setToast(m));
  useEffect(() => {
    loadMeta();
    loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function loadProducts() {
    setBusy(true);
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, code, slug, name, price, is_active, in_stock, featured, featured_order,
        description, brand, packaging, image_url,
        packaging_override, package_type, pack_qty, unit, volume_ml,
        category_id, brand_id,
        categories (name, abbr),
        brands (name, abbr),
        updated_at
      `)
      .order("updated_at", { ascending: false });

    setBusy(false);
    if (error) return setToast(error.message);
    setItems((data as any) ?? []);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => {
      const brandName = p.brands?.name ?? p.brand ?? "";
      return (
        p.name.toLowerCase().includes(s) ||
        (p.code ?? "").toLowerCase().includes(s) ||
        (p.slug ?? "").toLowerCase().includes(s) ||
        brandName.toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function openCreate() {
    setEditing(null);
    setImgs([]);
    setOpen(true);
  }

  async function openEdit(p: ProductRow) {
    setEditing(p);
    setOpen(true);
    await loadImages(p.id);
  }

  async function loadImages(productId: string) {
    const { data, error } = await supabase
      .from("product_images")
      .select("id,product_id,public_url,path,sort_order,is_primary,is_active")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("is_primary", { ascending: false })
      .order("sort_order", { ascending: true });

    if (error) return setToast(error.message);
    setImgs((data as any) ?? []);
  }

  async function saveProduct(form: Partial<ProductRow>) {
    // Quy tắc “không rối”: ưu tiên bảng mới, dọn field cũ
    const payload: any = {
      slug: (form.slug?.trim() || slugify(form.name || "")).slice(0, 120),
      name: (form.name ?? "").trim(),
      description: form.description ?? null,
      price: form.price ?? null,

      category_id: form.category_id ?? null,
      brand_id: form.brand_id ?? null,

      // fallback cũ -> set null nếu đã dùng id
      brand: form.brand_id ? null : (form.brand ?? null),

      // quy cách: ưu tiên override/pack chuẩn, fallback packaging cũ để null
      packaging_override: form.packaging_override?.trim() || null,
      package_type: form.package_type || null,
      pack_qty: form.pack_qty ?? null,
      unit: form.unit || null,
      volume_ml: form.volume_ml ?? null,
      packaging: null,

      // ảnh: ưu tiên product_images; image_url để fallback (ẩn UI)
      image_url: form.image_url ?? null,

      in_stock: form.in_stock ?? true,
      featured: form.featured ?? false,
      featured_order: form.featured_order ?? 0,
      is_active: form.is_active ?? false,
    };

    // nếu bật is_active mà chưa có code -> DB chặn; UI cũng chặn trước
    if (payload.is_active && (!form.code || form.code === "")) {
      setToast("Không thể bật hiển thị khi chưa có mã code (hãy chọn danh mục + hãng trước).");
      return;
    }

    const isEdit = Boolean(form.id);
    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", form.id!)
      : await supabase.from("products").insert(payload);

    if (error) return setToast(error.message);

    setToast(isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm");
    setOpen(false);
    await loadProducts();
  }

  async function removeProduct(id: string) {
    if (!confirm("Xoá sản phẩm?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return setToast(error.message);
    setToast("Đã xoá");
    await loadProducts();
  }

  // ========= IMAGE UPLOAD =========
  async function uploadImages(productId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setImgBusy(true);

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `${productId}/${fileName}`;
        
        // Upload lên storage
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false, contentType: file.type });

        if (upErr) throw upErr;

        const { data } = supabase.storage.from("product-images").getPublicUrl(path);

        console.log("publicUrl:", data?.publicUrl);``
        if (!data?.publicUrl) throw new Error("getPublicUrl() không trả publicUrl");

        // Nếu chưa có primary, set ảnh đầu tiên làm primary (tuỳ chọn)
        const hasPrimary = imgs.some((x) => x.is_primary);
        // Tạo record trong product_images
        const { error: dbErr } = await supabase.from("product_images").insert({
          product_id: productId,
          path,
          public_url: data.publicUrl,
          sort_order: 0,
          is_primary: !hasPrimary,
          is_active: true,
        });

        if (dbErr) throw dbErr;
      }

      await loadImages(productId);
      setToast("Đã upload ảnh");
    } catch (e: any) {
      setToast(e?.message ?? "Upload lỗi");
    } finally {
      setImgBusy(false);
    }
  }

  async function setPrimaryImage(productId: string, imageId: string) {
    // quan trọng: unset hết trước để không đụng unique partial index
    const { error: e1 } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    if (e1) return setToast(e1.message);

    const { error: e2 } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (e2) return setToast(e2.message);
    await loadImages(productId);
    setToast("Đã đặt ảnh đại diện");
  }

  async function deleteImage(row: ImgRow) {
    if (!confirm("Xoá ảnh?")) return;

    // xoá DB row trước
    const { error: e1 } = await supabase.from("product_images").delete().eq("id", row.id);
    if (e1) return setToast(e1.message);

    // xoá file trong storage (nếu policy cho phép)
    const { error: e2 } = await supabase.storage.from("product-images").remove([row.path]);
    if (e2) setToast(`Đã xoá DB, nhưng xoá file lỗi: ${e2.message}`);

    await loadImages(row.product_id);
    setToast("Đã xoá ảnh");
  }

  // ========= CATEGORY/BRAND CRUD (simple) =========
  // ĐÃ CHUYỂN SANG hook/useMeta.ts
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">Admin • Đại lý nước ngọt</div>
          <div className="ml-auto flex items-center gap-2 text-sm text-zinc-400">
            <span className="hidden sm:inline">{email}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Shell */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-3">
            <NavButton active={tab === "products"} onClick={() => setTab("products")}>
              Sản phẩm
            </NavButton>
            <NavButton active={tab === "categories"} onClick={() => setTab("categories")}>
              Danh mục
            </NavButton>
            <NavButton active={tab === "brands"} onClick={() => setTab("brands")}>
              Hãng
            </NavButton>
            <div className="mt-3 text-xs text-zinc-500">
              Tip: sản phẩm chỉ bật hiển thị khi đã có <b>code</b> (chọn danh mục + hãng).
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          {tab === "products" && (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div>
                  <div className="text-lg font-semibold">Sản phẩm</div>
                  <div className="text-sm text-zinc-400">Tạo/sửa/xoá, upload ảnh, set nổi bật.</div>
                </div>

                <div className="sm:ml-auto flex gap-2">
                  <input
                    className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 outline-none"
                    placeholder="Tìm theo tên / code / slug / hãng…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <button
                    onClick={openCreate}
                    className="rounded-xl bg-white text-zinc-950 px-4 py-2.5 font-medium"
                  >
                    + Thêm
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-auto rounded-xl border border-zinc-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-950 text-zinc-300">
                    <tr>
                      <th className="text-left px-3 py-2">Mã</th>
                      <th className="text-left px-3 py-2">Tên</th>
                      <th className="text-left px-3 py-2">Quy cách</th>
                      <th className="text-left px-3 py-2">Trạng thái</th>
                      <th className="text-right px-3 py-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {busy ? (
                      <tr><td className="px-3 py-6 text-zinc-400" colSpan={5}>Đang tải…</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td className="px-3 py-6 text-zinc-400" colSpan={5}>Chưa có sản phẩm.</td></tr>
                    ) : (
                      filtered.map((p) => {
                        const brandName = p.brands?.name ?? null;
                        const brand = formatBrand({ brand_name: brandName, brand: p.brand });
                        const packaging = formatPackaging(p);
                        const status =
                          p.is_active ? (p.in_stock ? "Đang bán" : "Đang hết hàng") : "Nháp";
                        return (
                          <tr key={p.id} className="border-t border-zinc-800">
                            <td className="px-3 py-2 font-mono text-xs">{p.code ?? "—"}</td>
                            <td className="px-3 py-2">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-zinc-400">
                                {brand ? `${brand} • ` : ""}{p.slug}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-zinc-300">{packaging || "—"}</td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center gap-2">
                                <Chip tone={p.is_active ? "green" : "zinc"}>{status}</Chip>
                                {p.featured && <Chip tone="amber">Nổi bật</Chip>}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => openEdit(p)}
                                className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900"
                              >
                                Sửa
                              </button>{" "}
                              <button
                                onClick={() => removeProduct(p.id)}
                                className="rounded-lg border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900 text-red-300"
                              >
                                Xoá
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "categories" && (
            <MetaEditor
              title="Danh mục"
              hint="Ví dụ: Bia (BI), Nước ngọt (NG)… Abbr 2 chữ IN HOA để sinh code."
              onSave={upsertCategory}
            />
          )}

          {tab === "brands" && (
            <MetaEditor
              title="Hãng"
              hint="Ví dụ: Sabeco (SA), Coca-Cola (CO)… Abbr 2 chữ IN HOA để sinh code."
              onSave={upsertBrand}
            />
          )}
        </main>
      </div>

      {/* Modal create/edit */}
      {open && (
        <ProductModal
          cats={cats}
          brs={brs}
          initial={editing}
          imgs={imgs}
          imgBusy={imgBusy}
          onClose={() => setOpen(false)}
          onSave={saveProduct}
          onUpload={(productId, files) => uploadImages(productId, files)}
          onPrimary={(productId, imageId) => setPrimaryImage(productId, imageId)}
          onDeleteImage={(row) => deleteImage(row)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm shadow">
          {toast}
          <button className="ml-3 text-zinc-300" onClick={() => setToast(null)}>OK</button>
        </div>
      )}
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl px-3 py-2.5 border",
        active ? "bg-white text-zinc-950 border-white" : "border-zinc-800 hover:bg-zinc-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Chip({ tone, children }: { tone: "green" | "amber" | "zinc"; children: React.ReactNode }) {
  const cls =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
      : tone === "amber"
      ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
      : "bg-zinc-500/15 text-zinc-200 border-zinc-500/30";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>{children}</span>;
}


function ProductModal({
  cats,
  brs,
  initial,
  imgs,
  imgBusy,
  onClose,
  onSave,
  onUpload,
  onPrimary,
  onDeleteImage,
}: {
  cats: Category[];
  brs: Brand[];
  initial: ProductRow | null;
  imgs: ImgRow[];
  imgBusy: boolean;
  onClose: () => void;
  onSave: (form: Partial<ProductRow>) => Promise<void>;
  onUpload: (productId: string, files: FileList | null) => Promise<void>;
  onPrimary: (productId: string, imageId: string) => Promise<void>;
  onDeleteImage: (row: ImgRow) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<ProductRow>>(
    initial ?? {
      name: "",
      slug: "",
      price: null,
      description: "",
      is_active: false,
      in_stock: true,
      featured: false,
      featured_order: 0,
      category_id: null,
      brand_id: null,
      packaging_override: "",
      package_type: "",
      pack_qty: null,
      unit: "",
      volume_ml: null,
    }
  );

  const canPublish = Boolean(form.code) || Boolean(initial?.code); // code sinh tự động khi đủ danh mục+hãng
  const previewBrand = (initial?.brands?.name ?? null) || "";
  const previewPack = formatPackaging(form as any);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-900 flex items-center gap-2">
          <div className="font-semibold">{initial ? "Sửa sản phẩm" : "Thêm sản phẩm"}</div>
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900">
              Đóng
            </button>
            <button
              onClick={() => onSave(form)}
              className="rounded-xl bg-white text-zinc-950 px-4 py-1.5 font-medium"
            >
              Lưu
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: product fields */}
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
              placeholder="Tên sản phẩm"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
            />
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
              placeholder="Slug (auto theo tên, có thể sửa)"
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
              >
                <option value="">— Danh mục —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.abbr ?? "--"} • {c.name}
                  </option>
                ))}
              </select>

              <select
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                value={form.brand_id ?? ""}
                onChange={(e) => setForm({ ...form, brand_id: e.target.value || null })}
              >
                <option value="">— Hãng —</option>
                {brs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.abbr ?? "--"} • {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                placeholder="Giá (VND) - để trống nếu Liên hệ"
                value={form.price ?? ""}
                onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })}
              />
              <input
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                placeholder="Thứ tự nổi bật (0..)"
                value={form.featured_order ?? 0}
                onChange={(e) => setForm({ ...form, featured_order: Number(e.target.value) || 0 })}
              />
            </div>

            <textarea
              className="w-full min-h-[90px] rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
              placeholder="Mô tả"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.in_stock ?? true}
                  onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                />
                Còn hàng
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured ?? false}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Nổi bật
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active ?? false}
                  onChange={(e) => {
                    if (e.target.checked && !canPublish) return;
                    setForm({ ...form, is_active: e.target.checked });
                  }}
                />
                Hiển thị
              </label>

              {!canPublish && (
                <span className="text-xs text-zinc-400">
                  (Chưa có code → chọn Danh mục + Hãng rồi lưu để sinh mã)
                </span>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
              <div className="text-sm font-medium">Quy cách</div>
              <div className="text-xs text-zinc-400 mt-1">Ưu tiên: override → pack chuẩn.</div>

              <input
                className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                placeholder="Override (vd: Két 20 chai thủy tinh 450ml) — để trống nếu dùng pack chuẩn"
                value={form.packaging_override ?? ""}
                onChange={(e) => setForm({ ...form, packaging_override: e.target.value })}
              />

              <div className="mt-3 grid grid-cols-4 gap-2">
                <select
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                  value={form.package_type ?? ""}
                  onChange={(e) => setForm({ ...form, package_type: e.target.value || null })}
                >
                  {PK_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <input
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                  placeholder="Số lượng"
                  value={form.pack_qty ?? ""}
                  onChange={(e) => setForm({ ...form, pack_qty: e.target.value ? Number(e.target.value) : null })}
                />

                <select
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                  value={form.unit ?? ""}
                  onChange={(e) => setForm({ ...form, unit: e.target.value || null })}
                >
                  {UNIT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <input

                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 outline-none"
                  placeholder="ml"
                  value={form.volume_ml ?? ""}
                  onChange={(e) => setForm({ ...form, volume_ml: e.target.value ? Number(e.target.value) : null })}
                />
              </div>

              <div className="mt-2 text-xs text-zinc-300">
                Preview: <span className="text-zinc-100">{previewPack || "—"}</span>
              </div>
            </div>
          </div>

          {/* Right: images */}
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3">
              <div className="flex items-center">
                <div className="text-sm font-medium">Ảnh sản phẩm</div>
                <div className="ml-auto text-xs text-zinc-400">
                  {initial?.code ? `Mã: ${initial.code}` : "Chưa có mã"}
                </div>
              </div>

              {!initial?.id ? (
                <div className="mt-3 text-sm text-zinc-400">
                  Lưu sản phẩm trước, rồi mới upload ảnh (cần product_id).
                </div>
              ) : (
                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={imgBusy}
                    onChange={(e) => onUpload(initial.id, e.target.files)}
                  />
                  {imgBusy && <div className="text-xs text-zinc-400 mt-2">Đang upload…</div>}
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                {imgs.map((im) => (
                  <div key={im.id} className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950">
                    <img src={im.public_url} alt="" className="aspect-square w-full object-cover" />
                    <div className="p-2 flex items-center gap-2">
                      {im.is_primary ? (
                        <span className="text-xs text-emerald-300">Đại diện</span>
                      ) : (
                        <button
                          onClick={() => onPrimary(im.product_id, im.id)}
                          className="text-xs rounded-lg border border-zinc-800 px-2 py-1 hover:bg-zinc-900"
                        >
                          Đặt đại diện
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteImage(im)}
                        className="ml-auto text-xs rounded-lg border border-zinc-800 px-2 py-1 hover:bg-zinc-900 text-red-300"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {imgs.length === 0 && initial?.id && (
                <div className="mt-3 text-sm text-zinc-400">Chưa có ảnh.</div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-3 text-sm">
              <div className="font-medium">Quy ước “không rối”</div>
              <ul className="mt-2 text-zinc-400 list-disc pl-5 space-y-1">
                <li>Admin chỉ chọn hãng từ dropdown (không nhập brand text).</li>
                <li>Ảnh ưu tiên gallery (primary), fallback image_url (ẩn).</li>
                <li>Quy cách ưu tiên override → pack chuẩn.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
