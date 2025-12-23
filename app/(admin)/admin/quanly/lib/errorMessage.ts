type SbError = {
  message?: string;
  code?: string;     // ví dụ: "23505"
  details?: string;
  hint?: string;
};

export function toUserMessage(err: SbError, fallback = "Có lỗi xảy ra, vui lòng thử lại.") {
  const msg = (err?.message ?? "").toLowerCase();
  const code = err?.code;

  // Postgres unique violation
  if (code === "23505" || msg.includes("duplicate key") || msg.includes("unique constraint")) {
    // map theo constraint name (nếu message có)
    if (msg.includes("brands_abbr_key")) return "Mã viết tắt của hãng đã tồn tại. Vui lòng chọn mã khác.";
    if (msg.includes("brands_slug_key")) return "Slug của hãng đã tồn tại. Vui lòng chọn slug khác.";
    if (msg.includes("brands_name_key")) return "Tên hãng đã tồn tại. Vui lòng chọn tên khác.";

    if (msg.includes("categories_abbr_key")) return "Mã viết tắt danh mục đã tồn tại. Vui lòng chọn mã khác.";
    if (msg.includes("categories_slug_key")) return "Slug danh mục đã tồn tại. Vui lòng chọn slug khác.";
    if (msg.includes("categories_name_key")) return "Tên danh mục đã tồn tại. Vui lòng chọn tên khác.";

    return "Dữ liệu bị trùng (đã tồn tại). Vui lòng kiểm tra lại.";
  }

  // Not-null / thiếu dữ liệu
  if (code === "23502" || msg.includes("null value") || msg.includes("not-null constraint")) {
    return "Bạn đang bỏ trống một trường bắt buộc. Vui lòng kiểm tra lại.";
  }

  // Foreign key
  if (code === "23503" || msg.includes("foreign key")) {
    return "Không thể lưu vì dữ liệu đang được liên kết ở nơi khác. Vui lòng kiểm tra ràng buộc.";
  }

  // Permission / RLS
  if (code === "42501" || msg.includes("permission denied") || msg.includes("row-level security")) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  return err?.message ? `Có lỗi: ${err.message}` : fallback;
}
