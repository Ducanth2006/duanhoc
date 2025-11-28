// --- IMPORT (NHẬP NGUYÊN LIỆU) ---
import React, { useState, useEffect } from "react";
// Nhập các khuôn mẫu dữ liệu (Interface)
import {
  Thuoc,
  NhaCungCap,
  ChiTietNhapCreate,
  PhieuNhapCreatePayload,
} from "../../interfaces";
// Nhập các hàm gọi API (Lấy danh sách thuốc, nhà cung cấp, lưu phiếu)
import { getNhaCungCapList } from "../../api/nhaCungCapApi";
import { getMedicines } from "../../api/thuocApi";
import { addPhieuNhap } from "../../api/phieuNhapApi";

// Nhập CSS để trang trí
import styles from "../../styles/PhieuNhapForm.module.css";

// Định nghĩa Props: Form này nhận 2 lệnh từ cha:
// 1. onClose: Ra lệnh đóng form.
// 2. onSave: Báo cho cha biết là "tôi lưu xong rồi".
interface PhieuNhapFormProps {
  onClose: () => void;
  onSave: () => void;
}

// Hàm nhỏ lấy ngày hôm nay dạng "2023-10-25" để điền sẵn vào ô ngày nhập
const getTodayString = () => new Date().toISOString().split("T")[0];

// --- BẮT ĐẦU COMPONENT ---
export const PhieuNhapForm: React.FC<PhieuNhapFormProps> = ({
  onClose,
  onSave,
}) => {
  // --- 1. KHAI BÁO STATE (BỘ NHỚ) ---

  // Danh sách nhà cung cấp để đổ vào ô chọn (Dropdown)
  const [nhaCungCapList, setNhaCungCapList] = useState<NhaCungCap[]>([]);

  // Danh sách thuốc (Kho thuốc) để đổ vào ô chọn tên thuốc
  const [allMedicines, setAllMedicines] = useState<Thuoc[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Thuoc[]>([]); // danh sách dữ liệu tạm thời
  // Nó giúp bạn thực hiện chức năng tìm kiếm/lọc (Filter) cực nhanh ngay trên trình duyệt mà không làm mất dữ liệu gốc đã tải về

  // Lưu xem người dùng đang chọn Nhà cung cấp nào (Lưu ID)
  const [selectedNCC, setSelectedNCC] = useState<string>("");

  // Lưu ngày nhập, mặc định là hôm nay
  const [ngayNhap, setNgayNhap] = useState(getTodayString());

  // QUAN TRỌNG NHẤT: Mảng chứa các dòng thuốc chi tiết
  // Mỗi phần tử là một dòng trên bảng (Tên thuốc, số lượng, giá...)
  const [chiTietRows, setChiTietRows] = useState<ChiTietNhapCreate[]>([
    // Mặc định khi mở form có sẵn 1 dòng trống
    { MaThuoc: 0, SoLuongNhap: 1, DonGiaNhap: 0, HanSuDung: "" },
  ]);

  // State xử lý lỗi và trạng thái đang lưu
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. LẤY DỮ LIỆU KHI MỞ FORM ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Chạy song song 2 lệnh lấy danh sách NCC và Thuốc cùng lúc cho nhanh
        const [nccData, medicinesData] = await Promise.all([
          getNhaCungCapList(),
          getMedicines(),
        ]);

        setNhaCungCapList(nccData);
        setAllMedicines(medicinesData);

        // Ban đầu lọc thuốc rỗng (hoặc có thể hiện tất cả tùy logic)
        setFilteredMedicines(medicinesData);
      } catch (err) {
        setError("Không thể tải danh sách thuốc hoặc nhà cung cấp.");
      }
    };

    fetchInitialData();
  }, []); // Chạy 1 lần duy nhất
  // --- 3. XỬ LÝ KHI NGƯỜI DÙNG THAY ĐỔI DỮ LIỆU ---

  // Khi chọn Nhà cung cấp
  const handleNCCChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nccId = e.target.value;
    setSelectedNCC(nccId);

    // Logic lọc: Nếu bạn muốn khi chọn NCC A chỉ hiện thuốc của NCC A (ở đây đang hiện tất cả)
    if (!nccId) {
      setFilteredMedicines(allMedicines);
    } else {
      // Có thể thêm logic lọc thuốc theo NCC ở đây nếu cần
      setFilteredMedicines(allMedicines);
    }
  };

  // QUAN TRỌNG: Xử lý thay đổi trong từng dòng thuốc (Thay đổi số lượng, giá, tên thuốc...)
  // index: Dòng thứ mấy đang bị sửa?
  // field: Đang sửa cột nào? (SoLuongNhap, DonGiaNhap...)
  // value: Giá trị mới là gì?
  // Tác dụng 1: Giúp ô nhập liệu "sống", cho phép người dùng nhìn thấy những gì họ đang gõ.

  const handleRowChange = (
    index: number,
    field: keyof ChiTietNhapCreate,
    value: any
  ) => {
    // 1. Copy danh sách cũ ra một mảng mới (nguyên tắc bất biến trong React)
    // Quy tắc vàng của React (Immutability - Bất biến):
    // Bạn KHÔNG ĐƯỢC PHÉP lấy bút tẩy xóa trực tiếp lên dữ liệu cũ. Muốn sửa gì, bạn phải PHOTOCOPY ra một bản mới, sửa trên bản photocopy đó, rồi nộp bản mới cho React.
    const newRows = [...chiTietRows];

    // 2. Cập nhật giá trị tại dòng (index) và cột (field) tương ứng
    newRows[index] = {
      ...newRows[index], // Giữ lại các thông tin cũ của dòng đó
      [field]: value, // Ghi đè thông tin mới vào
    };

    // 3. Lưu mảng mới vào State -> Giao diện tự cập nhật
    setChiTietRows(newRows);
  };

  // Thêm một dòng trống mới vào cuối bảng
  const handleAddRow = () => {
    setChiTietRows([
      ...chiTietRows, // Lấy toàn bộ dòng cũ
      { MaThuoc: 0, SoLuongNhap: 1, DonGiaNhap: 0, HanSuDung: "" }, // Thêm dòng mới
    ]);
  };

  // Xóa một dòng khỏi bảng
  const handleRemoveRow = (index: number) => {
    // Chỉ giữ lại những dòng có vị trí KHÁC với index cần xóa
    const newRows = chiTietRows.filter((_, i) => i !== index);
    setChiTietRows(newRows);
  };

  // --- 4. XỬ LÝ LƯU (SUBMIT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn việc reload lại trang web mặc định

    // --- Kiểm tra dữ liệu (Validate) ---
    if (!selectedNCC) {
      setError("Vui lòng chọn nhà cung cấp!");
      return;
    }

    // Kiểm tra từng dòng thuốc xem có hợp lệ không
    for (let i = 0; i < chiTietRows.length; i++) {
      const row = chiTietRows[i];
      if (row.MaThuoc === 0) {
        setError(`Dòng thứ ${i + 1}: Chưa chọn thuốc!`);
        return;
      }
      if (row.SoLuongNhap <= 0) {
        setError(`Dòng thứ ${i + 1}: Số lượng phải lớn hơn 0!`);
        return;
      }
      if (row.DonGiaNhap < 0) {
        setError(`Dòng thứ ${i + 1}: Đơn giá không được âm!`);
        return;
      }
      if (!row.HanSuDung) {
        setError(`Dòng thứ ${i + 1}: Chưa nhập hạn sử dụng!`);
        return;
      }
    }

    // --- Gửi dữ liệu đi ---
    setIsSubmitting(true); // Bật trạng thái "Đang lưu..."
    setError(null);

    // Chuẩn bị gói hàng (payload) đúng mẫu Backend yêu cầu
    const payload: PhieuNhapCreatePayload = {
      MaNhaCungCap: parseInt(selectedNCC),
      NgayNhap: new Date(ngayNhap).toISOString(),
      ChiTiet: chiTietRows.map((row) => ({
        MaThuoc: Number(row.MaThuoc),
        SoLuongNhap: Number(row.SoLuongNhap),
        DonGiaNhap: Number(row.DonGiaNhap),
        HanSuDung: new Date(row.HanSuDung).toISOString(), // Đổi định dạng ngày
      })),
    };

    try {
      await addPhieuNhap(payload); // Gọi người đưa thư (API)
      alert("Nhập hàng thành công!");
      onSave(); // Báo cho cha biết để tải lại bảng
      onClose(); // Đóng form
    } catch (err) {
      setError((err as Error).message || "Có lỗi xảy ra khi lưu.");
    } finally {
      setIsSubmitting(false); // Tắt trạng thái đang lưu
    }
  };
  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* Hàng 1: Chọn Nhà cung cấp và Ngày nhập */}
      <div className={styles.topControls}>
        <div className={styles.formGroup}>
          <label>Nhà Cung Cấp:</label>
          <select
            value={selectedNCC}
            onChange={handleNCCChange}
            className={styles.selectInput}
            required
          >
            <option value="">-- Chọn Nhà Cung Cấp --</option>
            {/* Duyệt danh sách NCC để tạo các option */}
            {nhaCungCapList.map((ncc) => (
              <option key={ncc.MaNhaCungCap} value={ncc.MaNhaCungCap}>
                {ncc.TenNhaCungCap}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Ngày Nhập:</label>
          <input
            type="date"
            value={ngayNhap}
            onChange={(e) => setNgayNhap(e.target.value)}
            className={styles.dateInput}
            required
          />
        </div>
      </div>

      {/* Bảng chi tiết thuốc */}
      <table className={styles.detailTable}>
        <thead>
          <tr>
            <th>Tên Thuốc</th>
            <th>Số Lượng</th>
            <th>Đơn Giá</th>
            <th>Thành Tiền</th> {/* Cột tự tính */}
            <th>Hạn Sử Dụng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {/* VÒNG LẶP QUAN TRỌNG: Vẽ từng dòng thuốc */}
          {/* map row là Giá trị của phần tử hiện tại đang được xử lý và index */}
          {chiTietRows.map((row, index) => (
            <tr key={index}>
              {/* Cột 1: Chọn tên thuốc */}
              <td>
                <select
                  value={row.MaThuoc}
                  // Khi chọn thuốc khác -> Gọi hàm sửa dòng (index), sửa cột MaThuoc
                  onChange={(e) =>
                    handleRowChange(index, "MaThuoc", e.target.value)
                  }
                  className={styles.tableSelect}
                  required
                >
                  <option value={0}>-- Chọn thuốc --</option>
                  {filteredMedicines.map((t) => (
                    <option key={t.MaThuoc} value={t.MaThuoc}>
                      {t.TenThuoc} ({t.DonViTinh})
                    </option>
                  ))}
                </select>
              </td>

              {/* Cột 2: Nhập số lượng */}
              <td>
                <input
                  type="number"
                  min="1"
                  value={row.SoLuongNhap}
                  onChange={(e) =>
                    handleRowChange(index, "SoLuongNhap", e.target.value)
                  }
                  className={styles.tableInput}
                  required
                />
              </td>

              {/* Cột 3: Nhập đơn giá */}
              <td>
                <input
                  type="number"
                  min="0"
                  value={row.DonGiaNhap}
                  onChange={(e) =>
                    handleRowChange(index, "DonGiaNhap", e.target.value)
                  }
                  className={styles.tableInput}
                  required
                />
              </td>

              {/* Cột 4: Thành tiền (Chỉ hiển thị, không sửa được) */}
              <td className={styles.totalCell}>
                {/* Công thức: Số lượng * Đơn giá */}
                {(row.SoLuongNhap * row.DonGiaNhap).toLocaleString("vi-VN")} đ
              </td>

              {/* Cột 5: Hạn sử dụng */}
              <td>
                <input
                  type="date"
                  value={row.HanSuDung}
                  onChange={(e) =>
                    handleRowChange(index, "HanSuDung", e.target.value)
                  }
                  required
                />
              </td>

              {/* Cột 6: Nút xóa dòng */}
              <td>
                <button
                  type="button" // Phải là type button để không kích hoạt submit form
                  onClick={() => handleRemoveRow(index)}
                  className={styles.removeRowButton}
                  disabled={chiTietRows.length <= 1} // Không cho xóa dòng cuối cùng
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nút thêm dòng mới */}
      <button
        type="button"
        onClick={handleAddRow}
        className={styles.addRowButton}
        disabled={!selectedNCC} // Phải chọn NCC trước mới cho thêm thuốc
      >
        + Thêm Thuốc
      </button>

      {/* Thông báo lỗi nếu có */}
      {error && <div className={styles.errorText}>{error}</div>}

      {/* Các nút Lưu/Hủy */}
      <div className={styles.buttonGroup}>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSubmitting} // Khi đang lưu thì khóa nút lại
        >
          {isSubmitting ? "Đang lưu..." : "Lưu Phiếu Nhập"}
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          Hủy Bỏ
        </button>
      </div>
    </form>
  );
};
