"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { formatBrand, formatPackaging, slugify } from "@/lib/admin-utils";
import MetaEditor from "./ui/MetaEditor";
import type { Category, Brand, ProductRow, ImgRow, ToastType } from "./type";
import { useMeta } from "./hook/useMeta";
import Toast from "./ui/Toast";
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
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const router = useRouter();

  const [tab, setTab] = useState<"products" | "categories" | "brands">("products");
  const [items, setItems] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");

  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>("success");
  //Lọc + Pagination
  const [filterCat, setFilterCat] = useState<string>("");   // category_id
  const [filterBrand, setFilterBrand] = useState<string>(""); // brand_id
  const [pageSize, setPageSize] = useState<number | "all">(5);
  const [page, setPage] = useState(1);

  // Modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  // Images
  const [imgs, setImgs] = useState<ImgRow[]>([]);
  const [imgBusy, setImgBusy] = useState(false);

  const notify = useCallback((message: string, type: ToastType = "info") => {
  setToastType(type);
  setToast(message);
}, []);

 const { loadMeta, upsertBrand, upsertCategory, cats, brs } = useMeta(supabase, notify);
  useEffect(() => {
    loadMeta();
    loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const [theme, setTheme] = useState<"dark" | "light">("dark");
useEffect(() => {
  const saved = localStorage.getItem("admin_theme");
  if (saved === "light" || saved === "dark") setTheme(saved);
}, []);

useEffect(() => {
  localStorage.setItem("admin_theme", theme);
}, [theme]);

useEffect(() => {
  setPage(1);
}, [q, filterCat, filterBrand, pageSize]);

  async function loadProducts() {
    setBusy(true);
    const { data, error } = await supabase
        .from("products")
        .select(`
        id, code, slug, name, badge, price, is_active, in_stock, featured, featured_order,
        description, brand, packaging, image_url,
        packaging_override, package_type, pack_qty, unit, volume_ml,
        category_id, brand_id,
        categories (name, abbr),
        brands (name, abbr),
        updated_at
        `)
      .order("updated_at", { ascending: false });

    setBusy(false);
    if (error) return setToastType("error"), setToast(error.message);
    setItems((data as any) ?? []);
  }

  const filtered = useMemo(() => {
  const s = q.trim().toLowerCase();
  return items.filter((p) => {
    // Lọc theo danh mục/hãng (theo id)
    if (filterCat && (p.category_id ?? "") !== filterCat) return false;
    if (filterBrand && (p.brand_id ?? "") !== filterBrand) return false;

    // Lọc theo từ khóa
    if (!s) return true;

    const brandName = p.brands?.name ?? p.brand ?? "";
    return (
      p.name.toLowerCase().includes(s) ||
      (p.code ?? "").toLowerCase().includes(s) ||
      (p.slug ?? "").toLowerCase().includes(s) ||
      brandName.toLowerCase().includes(s)
    );
  });
}, [items, q, filterCat, filterBrand]);

const total = filtered.length;

const totalPages = useMemo(() => {
  if (pageSize === "all") return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}, [total, pageSize]);

useEffect(() => {
  // Nếu đang ở trang > totalPages thì kéo về trang cuối
  if (pageSize === "all") {
    if (page !== 1) setPage(1);
  } else {
    if (page > totalPages) setPage(totalPages);
  }
}, [page, pageSize, totalPages]);

const paged = useMemo(() => {
  if (pageSize === "all") return filtered;
  const start = (page - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}, [filtered, page, pageSize]);

const showingFrom = total === 0 ? 0 : pageSize === "all" ? 1 : (page - 1) * pageSize + 1;
const showingTo = total === 0 ? 0 : pageSize === "all" ? total : Math.min(total, page * pageSize);


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

    if (error) return setToastType("error"), setToast(error.message);
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
      badge: form.badge?.trim() || null,

    };

    // nếu bật is_active mà chưa có code -> DB chặn; UI cũng chặn trước
    if (payload.is_active && (!form.code || form.code === "")) {
      setToast("Không thể bật hiển thị khi chưa có mã code (hãy chọn danh mục + thương hiệu trước).");
      return;
    }

    const isEdit = Boolean(form.id);
    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", form.id!)
      : await supabase.from("products").insert(payload);

    if (error) {
      setToastType("error");
      setToast(error.message);
      return;
    }

    setToast(isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm");
    setOpen(false);
    await loadProducts();
  }

  async function removeProduct(id: string) {
    if (!confirm("Xoá sản phẩm?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setToastType("error");
      setToast(error.message);
      return;
    }
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
      
      if (e1) {
        setToastType("error");
        setToast(e1.message);
        return;
      }
   
    const { error: e2 } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

   if (e2) {
        setToastType("error");
        setToast(e2.message);
        return;
      }
    await loadImages(productId);
    setToast("Đã đặt ảnh đại diện");
  }

  async function deleteImage(row: ImgRow) {
    if (!confirm("Xoá ảnh?")) return;

    // xoá DB row trước
    const { error: e1 } = await supabase.from("product_images").delete().eq("id", row.id);
    if (e1) {
        setToastType("error");
        setToast(e1.message);
        return;
      }

    // xoá file trong storage (nếu policy cho phép)
    const { error: e2 } = await supabase.storage.from("product-images").remove([row.path]);
    if (e2) {
      setToastType("error");
      setToast(`Đã xoá DB, nhưng xoá file lỗi: ${e2.message}`);
      return; 
    }

    await loadImages(row.product_id);
    setToast("Đã xoá ảnh");
  }

  // ========= CATEGORY/BRAND CRUD (simple) =========
  // ĐÃ CHUYỂN SANG hook/useMeta.ts
  const cls =
  theme === "dark"
    ? {
        page: "min-h-screen bg-zinc-950 text-zinc-100",
        topbar: "border-b border-zinc-900 bg-zinc-950/80",
        panel: "border-zinc-900 bg-zinc-900/40",
        muted: "text-zinc-400",
        tip: "text-zinc-500",
        input: "border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500",
        tableWrap: "border-zinc-800",
        thead: "bg-zinc-950 text-zinc-300",
        row: "border-t border-zinc-800",
        btnOutline: "border-zinc-800 hover:bg-zinc-900",
          toast:
          "border-white/10 bg-zinc-900/80 text-zinc-100 backdrop-blur",
        toastBtn:
          "rounded-xl px-3 py-1.5 bg-white/10 text-zinc-100 hover:bg-white/15",
            // accents
        toastSuccess: "border-emerald-400/25 bg-emerald-950/30 ring-1 ring-emerald-400/20",
        toastError: "border-rose-400/25 bg-rose-950/30 ring-1 ring-rose-400/20",


        toastBtnSuccess: "text-emerald-200",
        toastBtnError: "text-rose-200",
        primaryBtn: "bg-white text-zinc-950 hover:opacity-95",

        // modal
        overlay: "bg-black/60",
        modal: "border-zinc-800 bg-zinc-950 text-zinc-100",
        modalHeader: "border-zinc-900",
        field: "border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-500",
        card2: "border-zinc-800 bg-zinc-900/20",
        imgTile: "border-zinc-800 bg-zinc-950",
        imgBtn: "border-zinc-800 hover:bg-zinc-900",
        danger: "text-red-300",
        success: "text-emerald-300",
        preview: "text-zinc-300",
      }
    : {
        page: "min-h-screen bg-gray-50 text-gray-900",
        topbar: "border-b border-gray-200 bg-white/80",
        panel: "border-gray-200 bg-white shadow-sm",
        muted: "text-gray-600",
        tip: "text-gray-500",
        input: "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
        tableWrap: "border-gray-200 bg-white",
        thead: "bg-gray-50 text-gray-700",
        row: "border-t border-gray-200",
        btnOutline: "border-gray-200 hover:bg-gray-50",
        toast:
          "border-zinc-200 bg-white/90 text-zinc-900 backdrop-blur",
        toastBtn:
          "rounded-xl px-3 py-1.5 bg-black/5 text-zinc-800 hover:bg-black/10",
        primaryBtn: "bg-[#0213b0] text-white hover:opacity-95",
        // accents
        toastSuccess: "border-emerald-200 bg-emerald-50 ring-1 ring-emerald-500/10",
        toastError: "border-rose-200 bg-rose-50 ring-1 ring-rose-500/10",


        toastBtnSuccess: "text-emerald-700",
        toastBtnError: "text-rose-700",
        // modal
        overlay: "bg-black/35",
        modal: "border-gray-200 bg-white text-gray-900",
        modalHeader: "border-gray-200",
        field: "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
        card2: "border-gray-200 bg-gray-50",
        imgTile: "border-gray-200 bg-white",
        imgBtn: "border-gray-200 hover:bg-gray-50",
        danger: "text-red-700",
        success: "text-emerald-700",
        preview: "text-gray-700",
      };


return ( 
  <div className={cls.page}>
    {/* Top bar */}
    <div className={`sticky top-0 z-20 ${cls.topbar} backdrop-blur`}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <div className="font-semibold">Quản trị viên • Đại lý nước ngọt</div>

        <div className={`ml-auto flex items-center gap-2 text-sm ${cls.muted}`}>
          <span className="hidden sm:inline">{email}</span>

          {/* Toggle theme */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`rounded-lg border px-3 py-1.5 ${cls.btnOutline}`}
            title="Đổi chế độ sáng/tối"
          >
            {theme === "dark" ? "☀️ Sáng" : "🌙 Tối"}
          </button>

          <button
            onClick={logout}
            className={`rounded-lg border px-3 py-1.5 ${cls.btnOutline}`}
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
        <div className={`rounded-2xl border p-3 ${cls.panel}`}>
        <NavButton theme={theme} active={tab === "products"} onClick={() => setTab("products")}>
             Sản phẩm
        </NavButton>

        <NavButton theme={theme} active={tab === "categories"} onClick={() => setTab("categories")}>
            Ngành hàng
        </NavButton>

        <NavButton theme={theme} active={tab === "brands"} onClick={() => setTab("brands")}>
            Thương hiệu
        </NavButton>

          <div className={`mt-3 text-xs ${cls.tip}`}>
            Tip: sản phẩm chỉ bật hiển thị khi đã có <b>code</b> (chọn ngành hàng + thương hiệu).
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="col-span-12 md:col-span-9">
        {tab === "products" && (
          <div className={`rounded-2xl border p-4 ${cls.panel}`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div>
                <div className="text-lg font-semibold">Sản phẩm</div>
                <div className={`text-sm ${cls.muted}`}>
                  Tạo/sửa/xoá, upload ảnh, set nổi bật.
                </div>
              </div>

              <div className="sm:ml-auto flex gap-2">
                <input
                  className={`w-full sm:w-64 rounded-xl border p-2.5 outline-none ${cls.input}`}
                  placeholder="Tìm theo tên / code / slug / thương hiệu…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <button
                  onClick={openCreate}
                  className={`rounded-xl px-4 py-2.5 font-medium ${cls.primaryBtn}`}
                >
                  + Thêm
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                className={`w-full sm:w-56 rounded-xl border p-2.5 outline-none ${cls.input}`}
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="">Tất cả ngành hàng</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {/* {(c.abbr ?? "--") + " • " + c.name} */}
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className={`w-full sm:w-56 rounded-xl border p-2.5 outline-none ${cls.input}`}
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
              >
                <option value="">Tất cả thương hiệu</option>
                {brs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {/* {(b.abbr ?? "--") + " • " + b.name} */}
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                className={`w-full sm:w-44 rounded-xl border p-2.5 outline-none ${cls.input}`}
                value={pageSize}
                onChange={(e) => {
                  const v = e.target.value;
                  setPageSize(v === "all" ? "all" : Number(v));
                }}
              >
                <option value={5}>Hiển thị 5</option>
                <option value={10}>Hiển thị 10</option>
                <option value={20}>Hiển thị 20</option>
                <option value="all">Tất cả</option>
              </select>

              <div className={`sm:ml-auto text-sm ${cls.muted}`}>
                Đang xem: <b>{showingFrom}</b>–<b>{showingTo}</b> / <b>{total}</b>
              </div>
            </div>

            <div className={`mt-4 overflow-auto rounded-xl border ${cls.tableWrap}`}>
              <table className="min-w-full text-sm">
                <thead className={cls.thead}>
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
                    <tr>
                      <td className={`px-3 py-6 ${cls.muted}`} colSpan={5}>
                        Đang tải…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className={`px-3 py-6 ${cls.muted}`} colSpan={5}>
                        Chưa có sản phẩm.
                      </td>
                    </tr>
                  ) : (
                    paged.map((p) => {
                      const brandName = p.brands?.name ?? null;
                      const brand = formatBrand({ brand_name: brandName, brand: p.brand });
                      const packaging = formatPackaging(p);
                      const status =
                        p.is_active ? (p.in_stock ? "Đang bán" : "Đang hết hàng") : "Nháp";

                      return (
                        <tr key={p.id} className={cls.row}>
                          <td className="px-3 py-2 font-mono text-xs">{p.code ?? "—"}</td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{p.name}</div>
                            <div className={`text-xs ${cls.muted}`}>
                              {brand ? `${brand} • ` : ""}
                              {p.slug}
                            </div>
                          </td>
                          <td className="px-3 py-2">{packaging || "—"}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-2">
                              <Chip theme={theme} tone={p.is_active ? "green" : "zinc"}>{status}</Chip>
                              {p.featured && <Chip theme={theme} tone="amber">Nổi bật</Chip>}
                              {p.badge && <Chip theme={theme} tone="amber">{p.badge}</Chip>}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => openEdit(p)}
                              className={`rounded-lg border px-3 py-1.5 ${cls.btnOutline}`}
                            >
                              Sửa
                            </button>{" "}
                            <button
                              onClick={() => removeProduct(p.id)}
                              className={`rounded-lg border px-3 py-1.5 ${cls.btnOutline} ${theme === "dark" ? "text-red-300" : "text-red-700"}`}
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
            {pageSize !== "all" && total > 0 && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  className={`rounded-lg border px-3 py-1.5 ${cls.btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Trước
                </button>

                <div className={`text-sm ${cls.muted}`}>
                  Trang <b>{page}</b> / <b>{totalPages}</b>
                </div>

                <button
                  className={`rounded-lg border px-3 py-1.5 ${cls.btnOutline} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Sau →
                </button>
              </div>
            )}
            
          </div>
        )}

        {tab === "categories" && (
          <MetaEditor
            title="Ngành hàng"
            hint="Ví dụ: Bia (BI), Nước ngọt (NG)… Abbr 2 chữ IN HOA để sinh code."
            onSave={upsertCategory}
            theme={theme}

          />
        )}

        {tab === "brands" && (
          <MetaEditor
            title="Thương hiệu"
            hint="Ví dụ: Sabeco (SA), Coca-Cola (CO)… Abbr 2 chữ IN HOA để sinh code."
            onSave={upsertBrand}
            theme={theme}
          />
        )}
      </main>
    </div>

    {/* Modal create/edit */}
    {open && (
      <ProductModal
        theme={theme}
        cls={cls}
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
      <Toast
        message={toast}
        onClose={() => setToast(null)}
        duration={2600}
        className={`${cls.toast} ${toastType === "success" ? cls.toastSuccess : cls.toastError}`}
        buttonClassName={`${cls.toastBtn} ${toastType === "success" ? cls.toastBtnSuccess : cls.toastBtnError}`}
      />
    )}

  </div>
);

}

function NavButton({
  active,
  onClick,
  children,
  theme,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  theme: "dark" | "light";
}) {
  const base = "w-full text-left rounded-xl px-3 py-2.5 border transition";

  const dark = active
    ? "bg-white text-zinc-950 border-white"
    : "border-zinc-800 text-zinc-100 hover:bg-zinc-900";

  const light = active
    ? "bg-[#0213b0] text-white border-[#0213b0]"
    : "border-gray-200 text-gray-900 hover:bg-gray-50";

  return (
    <button onClick={onClick} className={[base, theme === "dark" ? dark : light].join(" ")}>
      {children}
    </button>
  );
}


function Chip({
  tone,
  children,
  theme,
}: {
  tone: "green" | "amber" | "zinc";
  children: React.ReactNode;
  theme: "dark" | "light";
}) {
  const dark =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
      : tone === "amber"
      ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
      : "bg-zinc-500/15 text-zinc-200 border-zinc-500/30";

  const light =
    tone === "green"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : "bg-gray-100 text-gray-900 border-gray-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        theme === "dark" ? dark : light,
      ].join(" ")}
    >
      {children}
    </span>
  );
}


function ProductModal({
  theme,
  cls,
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
  theme: "dark" | "light";
  cls: any;
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
      badge: "",
    }
  );

  // ✅ Tabs mobile
  const [mobileTab, setMobileTab] = useState<"info" | "images">("info");
  useEffect(() => {
    // mở modal / đổi item -> quay về tab thông tin cho dễ nhập
    setMobileTab("info");
  }, [initial?.id]);

  const canPublish = Boolean(form.code) || Boolean(initial?.code);
  const previewPack = formatPackaging(form as any);

  function TabBtn({ id, label }: { id: "info" | "images"; label: string }) {
    const active = mobileTab === id;
    return (
      <button
        type="button"
        onClick={() => setMobileTab(id)}
        className={[
          "rounded-xl border px-3 py-2 text-sm font-semibold transition",
          active ? cls.primaryBtn : cls.btnOutline,
        ].join(" ")}
      >
        {label}
      </button>
    );
  }

  // ✅ Left block: Thông tin
  const Left = (
    <div className="space-y-3">
      <input
        className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
        placeholder="Tên sản phẩm"
        value={form.name ?? ""}
        onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })
        }
      />

      <input
        className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
        placeholder="Slug (auto theo tên, có thể sửa)"
        value={form.slug ?? ""}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />

      <input
        className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
        placeholder="Badge (vd: Bán chạy / Phổ biến / Mới về)"
        value={(form.badge ?? "") as any}
        onChange={(e) => setForm({ ...form, badge: e.target.value })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          className={`rounded-xl border p-2.5 outline-none ${cls.field}`}
          value={form.category_id ?? ""}
          onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
        >
          <option value="">— Ngành hàng —</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.abbr ?? "--"} • {c.name}
              {/* {c.name} */}
            </option>
          ))}
        </select>

        <select
          className={`rounded-xl border p-2.5 outline-none ${cls.field}`}
          value={form.brand_id ?? ""}
          onChange={(e) => setForm({ ...form, brand_id: e.target.value || null })}
        >
          <option value="">— Thương hiệu —</option>
          {brs.map((b) => (
            <option key={b.id} value={b.id}>
              {b.abbr ?? "--"} • {b.name}
              {/* {b.name} */}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
          placeholder="Giá (VND) - để trống nếu Liên hệ"
          value={form.price ?? ""}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })
          }
        />
        <input
          className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
          placeholder="Thứ tự nổi bật (0..)"
          value={form.featured_order ?? 0}
          onChange={(e) =>
            setForm({ ...form, featured_order: Number(e.target.value) || 0 })
          }
        />
      </div>

      <textarea
        className={`w-full min-h-[100px] rounded-xl border p-2.5 outline-none ${cls.field}`}
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
          <span className={`text-xs ${cls.muted}`}>
            (Chưa có code → chọn Ngành hàng + Thương hiệu rồi lưu để sinh mã)
          </span>
        )}
      </div>

      <div className={`rounded-xl border p-3 ${cls.card2}`}>
        <div className="text-sm font-medium">Quy cách</div>
        <div className={`text-xs mt-1 ${cls.muted}`}>Ưu tiên: override → pack chuẩn.</div>

        <input
          className={`mt-3 w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
          placeholder="Override (vd: Két 20 chai thủy tinh 450ml) — để trống nếu dùng pack chuẩn"
          value={form.packaging_override ?? ""}
          onChange={(e) => setForm({ ...form, packaging_override: e.target.value })}
        />

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            className={`rounded-xl border p-2.5 outline-none ${cls.field}`}
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
            className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
            placeholder="Số lượng"
            value={form.pack_qty ?? ""}
            onChange={(e) =>
              setForm({ ...form, pack_qty: e.target.value ? Number(e.target.value) : null })
            }
          />

          <select
            className={`rounded-xl border p-2.5 outline-none ${cls.field}`}
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
            className={`w-full rounded-xl border p-2.5 outline-none ${cls.field}`}
            placeholder="ml"
            value={form.volume_ml ?? ""}
            onChange={(e) =>
              setForm({ ...form, volume_ml: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>

        <div className={`mt-2 text-xs ${cls.preview}`}>
          Preview: <span className={`font-semibold ${cls.success}`}>{previewPack || "—"}</span>
        </div>
      </div>
    </div>
  );

  // ✅ Right block: Ảnh + quy ước
  const Right = (
    <div className="space-y-3">
      <div className={`rounded-xl border p-3 ${cls.card2}`}>
        <div className="flex items-center">
          <div className="text-sm font-medium">Ảnh sản phẩm</div>
          <div className={`ml-auto text-xs ${cls.muted}`}>
            {initial?.code ? `Mã: ${initial.code}` : "Chưa có mã"}
          </div>
        </div>

        {!initial?.id ? (
          <div className={`mt-3 text-sm ${cls.muted}`}>
            Lưu sản phẩm trước, rồi mới upload ảnh (vì cần có mã sản phẩm trước).
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
            {imgBusy && <div className={`text-xs mt-2 ${cls.muted}`}>Đang upload…</div>}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {imgs.map((im) => (
            <div key={im.id} className={`rounded-xl border overflow-hidden ${cls.imgTile}`}>
              <img src={im.public_url} alt="" className="aspect-square w-full object-cover" />
              <div className="p-2 flex items-center gap-2">
                {im.is_primary ? (
                  <span className={`text-xs ${cls.success}`}>Đại diện</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPrimary(im.product_id, im.id)}
                    className={`text-xs rounded-lg border px-2 py-1 ${cls.imgBtn}`}
                  >
                    Đặt đại diện
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteImage(im)}
                  className={`ml-auto text-xs rounded-lg border px-2 py-1 ${cls.imgBtn} ${cls.danger}`}
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>

        {imgs.length === 0 && initial?.id && (
          <div className={`mt-3 text-sm ${cls.muted}`}>Chưa có ảnh.</div>
        )}
      </div>

      <div className={`rounded-xl border p-3 ${cls.card2}`}>
        <div className="font-medium">Quy ước “không rối”</div>
        <ul className={`mt-2 list-disc pl-5 space-y-1 text-sm ${cls.muted}`}>
          <li>Admin chỉ chọn thương hiệu từ dropdown (không nhập brand text).</li>
          <li>Ảnh ưu tiên gallery (primary), fallback image_url (ẩn).</li>
          <li>Quy cách ưu tiên override → pack chuẩn.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 ${cls.overlay} p-2 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-xl overflow-hidden ${cls.modal}`}
        style={{ maxHeight: "calc(100dvh - 16px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <div
          className={`p-3 sm:p-4 border-b flex items-center gap-2 ${cls.modalHeader} sticky top-0 z-20 backdrop-blur`}
        >
          <div className="font-semibold">{initial ? "Sửa sản phẩm" : "Thêm sản phẩm"}</div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border px-3 py-1.5 ${cls.btnOutline}`}
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => onSave(form)}
              className={`rounded-xl px-4 py-1.5 font-medium ${cls.primaryBtn}`}
            >
              Lưu
            </button>
          </div>
        </div>

        {/* Tabs (mobile only) */}
        <div className="px-3 sm:px-4 pt-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            <TabBtn id="info" label="Thông tin" />
            <TabBtn id="images" label="Ảnh" />
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="p-3 sm:p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100dvh - 160px)" }}
        >
          {/* Desktop: 2 cột */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4">
            {Left}
            {Right}
          </div>

          {/* Mobile: theo tab */}
          <div className="lg:hidden">{mobileTab === "info" ? Left : Right}</div>
        </div>
      </div>
    </div>
  );
}

