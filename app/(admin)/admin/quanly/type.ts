export type Category = { id: string; name: string; slug: string; abbr: string | null };
export type Brand    = { id: string; name: string; slug: string; abbr: string | null };
export type ToastType = "success" | "error" | "info";
export type Notify = (message: string, type?: ToastType) => void;

export type ProductRow = {
  id: string;
  code: string | null;
  slug: string;
  name: string;
  price: number | null;
  is_active: boolean;
  in_stock: boolean;
  featured: boolean;
  featured_order: number;
  description: string | null;

  brand: string | null;
  packaging: string | null;
  image_url: string | null;

  packaging_override: string | null;
  package_type: string | null;
  pack_qty: number | null;
  unit: string | null;
  volume_ml: number | null;

  category_id: string | null;
  brand_id: string | null;

  categories?: { name: string; abbr: string | null } | null;
  brands?: { name: string; abbr: string | null } | null;

  updated_at: string;
  badge: string | null;
};

export type ImgRow = {
  id: string;
  product_id: string;
  public_url: string;
  path: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
};
