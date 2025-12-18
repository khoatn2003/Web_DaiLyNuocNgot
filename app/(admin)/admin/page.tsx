"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  packaging: string | null;
  price: number | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({ is_active: true });
  const [msg, setMsg] = useState<string | null>(null);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setMsg(error.message);
      return;
    }
    setProducts((data ?? []) as Product[]);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setMsg(null);

      const { data } = await supabase.auth.getSession();
      const s = data.session;

      if (!mounted) return;

      if (!s) {
        setLoading(false);
        router.replace("/admin/login");
        return;
      }

      setSession(s);

      // Check admin quyền
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", s.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (pErr) {
        setMsg(pErr.message);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const ok = !!profile?.is_admin;
      setIsAdmin(ok);

      if (!ok) {
        setLoading(false);
        return;
      }

      await loadProducts();
      if (!mounted) return;

      setLoading(false);
    })();

    // Lắng nghe đổi trạng thái đăng nhập
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) router.replace("/admin/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function save() {
    setMsg(null);

    const payload = {
      slug: form.slug?.trim() || slugify(form.name ?? ""),
      name: form.name?.trim(),
      brand: form.brand?.trim() || null,
      packaging: form.packaging?.trim() || null,
      price: form.price ?? null,
      image_url: form.image_url?.trim() || null,
      description: form.description?.trim() || null,
      is_active: form.is_active ?? true,
    };

    if (!payload.name) return setMsg("Thiếu tên sản phẩm.");

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) return setMsg(error.message);
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return setMsg(error.message);
    }

    setForm({ is_active: true });
    setEditingId(null);
    await loadProducts();
  }

  async function remove(id: string) {
    if (!confirm("Xoá sản phẩm này?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return setMsg(error.message);

    await loadProducts();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) return <main className="p-6">Đang tải…</main>;

  // Nếu không có session thì đã redirect rồi
  if (!session) return null;

  if (!isAdmin) {
    return (
      <main className="p-6">
        <div>Tài khoản này không có quyền admin.</div>
        <button className="underline mt-3" onClick={logout}>
          Đăng xuất
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button className="underline" onClick={logout}>
          Đăng xuất
        </button>
      </div>

      {msg && <div className="text-red-600 mt-3">{msg}</div>}

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

          <div className="flex flex-col gap-2">
            <input
              className="border p-2 rounded"
              placeholder="Tên sản phẩm"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Slug (để trống sẽ tự tạo)"
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Hãng (Coca/Pepsi...)"
              value={form.brand ?? ""}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Quy cách (VD: Thùng 24 lon 330ml)"
              value={form.packaging ?? ""}
              onChange={(e) => setForm({ ...form, packaging: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Giá (VND, có thể bỏ trống)"
              value={form.price ?? ""}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })
              }
            />
            <input
              className="border p-2 rounded"
              placeholder="Link ảnh (image_url)"
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <textarea
              className="border p-2 rounded"
              placeholder="Mô tả"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Hiển thị (is_active)
            </label>

            <div className="flex gap-2 mt-2">
              <button className="border rounded px-4 py-2" onClick={save}>
                Lưu
              </button>
              {editingId && (
                <button
                  className="border rounded px-4 py-2"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ is_active: true });
                  }}
                >
                  Huỷ
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Danh sách</h2>

          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <div key={p.id} className="border rounded p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.packaging}</div>
                  <div className="text-sm">
                    Slug: {p.slug} — {p.is_active ? "Đang hiển thị" : "Đang ẩn"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="underline"
                    onClick={() => {
                      setEditingId(p.id);
                      setForm(p);
                    }}
                  >
                    Sửa
                  </button>
                  <button className="underline text-red-600" onClick={() => remove(p.id)}>
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
