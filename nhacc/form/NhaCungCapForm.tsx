import React, { useState } from "react";
import { NhaCungCap } from "../../interfaces";
import { addNhaCungCap, updateNhaCungCap } from "../../api/nhaCungCapApi";
import styles from "../../styles/Form.module.css";

// Quy định những thứ BẮT BUỘC phải truyền vào khi dùng Form này
interface NhaCungCapFormProps {
  supplier: NhaCungCap | null; // Dữ liệu cũ (để sửa) hoặc null (để thêm mới)
  onSave: () => void; // Hàm gọi lại khi lưu xong
  onClose: () => void; // Hàm gọi lại khi đóng
}

export const NhaCungCapForm: React.FC<NhaCungCapFormProps> = ({
  supplier,
  onSave,
  onClose,
}) => {
  // --- KHỞI TẠO DỮ LIỆU FORM ---
  // Nếu có 'supplier' (đang sửa) -> Lấy thông tin điền vào.
  // Nếu không (thêm mới) -> Điền rỗng ''.
  const [formData, setFormData] = useState<Partial<NhaCungCap>>({
    TenNhaCungCap: supplier?.TenNhaCungCap || "",
    DiaChi: supplier?.DiaChi || "",
    SoDienThoai: supplier?.SoDienThoai || "",
    Email: supplier?.Email || "",
  });

  // Trạng thái nút Lưu (để disable khi đang gửi dữ liệu tránh bấm nhiều lần)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Biến chứa thông báo lỗi
  const [formError, setFormError] = useState<string | null>(null);

  // --- HÀM XỬ LÝ KHI GÕ PHÍM ---
  // Chạy mỗi khi bạn gõ 1 ký tự vào bất kỳ ô nào
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target; // Lấy tên ô (ví dụ 'Email') và giá trị vừa gõ
    setFormData((prev) => ({
      ...prev, // Giữ nguyên các ô khác
      [name]: value, // Chỉ cập nhật ô đang gõ
    }));
  };

  // --- HÀM XỬ LÝ KHI BẤM LƯU ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn trang web reload (mặc định của HTML Form)
    setIsSubmitting(true); // Bật trạng thái "Đang lưu..."
    setFormError(null); // Xóa lỗi cũ

    // Gói ghém dữ liệu để chuẩn bị gửi đi
    const dataToSave: Partial<NhaCungCap> = {
      TenNhaCungCap: formData.TenNhaCungCap,
      DiaChi: formData.DiaChi,
      SoDienThoai: formData.SoDienThoai,
      Email: formData.Email,
    };

    try {
      // Kiểm tra xem đang ở chế độ nào?
      if (supplier && supplier.MaNhaCungCap) {
        // Có mã -> Là SỬA -> Gọi API update
        await updateNhaCungCap(supplier.MaNhaCungCap, dataToSave);
      } else {
        // Không có mã -> Là THÊM MỚI -> Gọi API add
        await addNhaCungCap(dataToSave);
      }

      // Nếu thành công: Gọi hàm onSave để báo cho cha biết
      onSave();
    } catch (err) {
      // Nếu thất bại: Hiện lỗi lên form
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false); // Tắt trạng thái "Đang lưu..."
    }
  };

  // --- GIAO DIỆN FORM ---
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        {/* Logic hiển thị thông minh: Chỉ hiện ô Mã khi đang Sửa */}
        {supplier && (
          <div className={styles.formGroup}>
            <label htmlFor="MaNhaCungCap">Mã NCC</label>
            <input
              type="text"
              id="MaNhaCungCap"
              name="MaNhaCungCap"
              value={supplier.MaNhaCungCap}
              disabled // Khóa lại không cho sửa mã
              className={styles.disabledInput}
            />
          </div>
        )}

        {/* Các ô nhập liệu khác */}
        <div className={styles.formGroup}>
          <label htmlFor="TenNhaCungCap">Tên Nhà Cung Cấp *</label>
          <input
            type="text"
            id="TenNhaCungCap"
            name="TenNhaCungCap" // Quan trọng: phải khớp với tên biến trong formData
            value={formData.TenNhaCungCap}
            onChange={handleChange}
            required // Bắt buộc nhập
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="SoDienThoai">Số Điện Thoại</label>
          <input
            type="tel"
            id="SoDienThoai"
            name="SoDienThoai"
            value={formData.SoDienThoai}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="Email">Email</label>
          <input
            type="email"
            id="Email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="DiaChi">Địa Chỉ</label>
          <textarea
            id="DiaChi"
            name="DiaChi"
            rows={3} // Độ cao 3 dòng
            value={formData.DiaChi}
            onChange={handleChange}
            className={styles.fullWidthTextarea}
          />
        </div>
      </div>

      {/* Khu vực hiện thông báo lỗi (màu đỏ) */}
      {formError && <div className={styles.errorText}>{formError}</div>}

      {/* Các nút bấm */}
      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          Hủy
        </button>
      </div>
    </form>
  );
};
