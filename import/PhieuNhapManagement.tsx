// --- PHẦN 1: IMPORT (NHẬP KHẨU NGUYÊN LIỆU) ---
// React: Thư viện chính để xây dựng giao diện.
// useState: "Bộ nhớ" của trang web, dùng để lưu trữ dữ liệu thay đổi (ví dụ: danh sách thuốc).
// useEffect: "Cái kích hoạt", dùng để chạy code tự động (ví dụ: vừa vào trang là tự tải dữ liệu).
import React, { useState, useEffect } from "react";

// Nhập hàm gọi API (người đưa thư) để lấy dữ liệu từ Server về.
import { getChiTietNhapList } from "../../api/phieuNhapApi";

// Nhập khuôn mẫu dữ liệu (Interface) để máy tính hiểu 1 dòng "Phiếu Nhập" gồm những thông tin gì (Tên, tuổi, giá...).
import { ChiTietNhapLichSu } from "../../interfaces";

// Nhập file CSS để trang trí cho trang này đẹp hơn.
import styles from "../../styles/AdminManagement.module.css";

// Nhập các Component con (như lắp ghép lego):
// ModalWithAnimation: Cái khung cửa sổ bật lên (popup) đẹp mắt.
// PhieuNhapForm: Cái form điền thông tin nằm bên trong cửa sổ bật lên.
import ModalWithAnimation from "../../components/common/ModalWithAnimation";
import { PhieuNhapForm } from "../../components/AdminForms/PhieuNhapForm";
// Nhập file CSS riêng cho Modal.
import modalStyles from "../../styles/Modal.module.css";

// --- PHẦN 2: HÀM TIỆN ÍCH (HELPER FUNCTIONS) ---
// Đây là những công cụ nhỏ giúp xử lý dữ liệu thô thành dữ liệu đẹp mắt.

// Hàm đổi ngày tháng từ dạng máy tính (ISO string: "2023-10-05T00:00:00Z")
// sang dạng người Việt đọc ("05/10/2023").
const formatDate = (isoString: string) => {
  if (!isoString) return "N/A"; // Nếu không có dữ liệu thì hiện "N/A" (Not Available)
  try {
    // new Date(): Tạo đối tượng thời gian
    // .toLocaleDateString: Chuyển đổi sang định dạng địa phương (vi-VN)
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit", // 2 chữ số ngày
      month: "2-digit", // 2 chữ số tháng
      year: "numeric", // hiển thị đầy đủ năm
    });
  } catch (error) {
    return "Ngày lỗi"; // Phòng trường hợp dữ liệu rác
  }
};

// Hàm đổi con số (100000) thành tiền Việt (100.000 đ)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- PHẦN 3: COMPONENT CHÍNH (MAIN COMPONENT) ---
// Đây là nơi tạo ra toàn bộ giao diện bạn nhìn thấy.
export const PhieuNhapManagement = () => {
  // 1. KHAI BÁO STATE (BỘ NHỚ TẠM)
  // ---------------------------------------------
  // history: Biến lưu danh sách phiếu nhập lấy từ server. Ban đầu là mảng rỗng [].
  // setHistory: Hàm dùng để thay đổi giá trị của history.
  const [history, setHistory] = useState<ChiTietNhapLichSu[]>([]);

  // isLoading: Biến đánh dấu xem "đang tải" hay xong rồi. Ban đầu là true (đang tải xoay xoay).
  const [isLoading, setIsLoading] = useState(true);

  // error: Biến lưu thông báo lỗi nếu tải thất bại. Ban đầu là null (không có lỗi).
  const [error, setError] = useState<string | null>(null);

  // isModalOpen: Biến quyết định cái cửa sổ nhập hàng đang MỞ hay ĐÓNG.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. HÀM XỬ LÝ LOGIC (FUNCTIONS)
  // ---------------------------------------------

  // Hàm này chuyên đi lấy dữ liệu từ Server (Bất đồng bộ - async)
  const fetchData = async () => {
    setIsLoading(true); // Bước 1: Bật trạng thái "Đang tải..."
    setError(null); // Bước 2: Xóa hết lỗi cũ (nếu có)
    try {
      // await: Tạm dừng ở đây đợi Server trả lời (giống như đợi người yêu nhắn tin lại)
      const data = await getChiTietNhapList();

      setHistory(data); // Bước 3: Có dữ liệu rồi, lưu vào biến history
    } catch (err) {
      // Nếu có lỗi (mạng rớt, server sập...), lưu lỗi vào biến error
      setError((err as Error).message);
    } finally {
      // Dù thành công hay thất bại, cuối cùng cũng phải tắt cái vòng xoay "Đang tải" đi
      setIsLoading(false);
    }
  };

  // useEffect này chạy ĐÚNG 1 LẦN khi người dùng vừa mở trang này lên.
  // Lý do: Có mảng rỗng [] ở cuối.
  useEffect(() => {
    fetchData(); // Gọi hàm lấy dữ liệu ngay lập tức
  }, []);

  // Hàm xử lý khi bấm nút "Thêm mới" -> Mở cửa sổ lên
  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  // Hàm xử lý khi người dùng lưu thành công trong form
  const handleSaveSuccess = () => {
    setIsModalOpen(false); // 1. Đóng cửa sổ lại
    fetchData(); // 2. Tải lại bảng dữ liệu để thấy cái mới vừa thêm
  };

  // 3. GIAO DIỆN (JSX - HTML TRONG JAVASCRIPT)
  // ---------------------------------------------
  return (
    <div className={styles.adminManagementPage}>
      {/* --- HEADER: TIÊU ĐỀ VÀ NÚT BẤM --- */}
      <header className={styles.header}>
        <h1>Lịch Sử Nhập Thuốc & Quản Lý Lô</h1>
        <button onClick={handleAddClick} className={styles.addButton}>
          + Nhập Hàng Mới
        </button>
      </header>

      {/* --- PHẦN HIỂN THỊ TRẠNG THÁI --- */}
      {/* Nếu đang tải (isLoading = true) thì hiện dòng chữ này */}
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}

      {/* Nếu có lỗi (error khác null) thì hiện dòng chữ đỏ này */}
      {error && <div className={styles.error}>Lỗi: {error}</div>}

      {/* --- PHẦN BẢNG DỮ LIỆU --- */}
      {/* Chỉ hiện bảng khi KHÔNG tải và KHÔNG lỗi */}
      {!isLoading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            {/* Tiêu đề các cột */}
            <thead>
              <tr>
                <th>Mã Phiếu</th>
                <th>Ngày Nhập</th>
                <th>Tên Thuốc</th>
                <th>Nhà Cung Cấp</th>
                <th>SL Nhập</th>
                <th>Tồn Lô</th>
                <th>Đơn Giá</th>
                <th>Hạn Sử Dụng</th>
              </tr>
            </thead>

            {/* Thân bảng: Nơi chứa dữ liệu từng dòng */}
            <tbody>
              {/* Kiểm tra: Nếu danh sách có dữ liệu (>0) thì dùng vòng lặp map để vẽ từng dòng */}
              {history.length > 0 ? (
                history.map((item, index) => {
                  // --- LOGIC MÀU SẮC CHO TỪNG DÒNG ---

                  // Kiểm tra: Lô này bán hết chưa? (Số lượng còn lại = 0)
                  const isSoldOut = item.SoLuongConLai === 0;

                  // Kiểm tra: Sắp hết hạn chưa? (Lấy ngày hết hạn trừ ngày hiện tại < 30 ngày)
                  const isExpiringSoon =
                    new Date(item.HanSuDung).getTime() - new Date().getTime() <
                    30 * 24 * 60 * 60 * 1000; // do js hiểu theo milisecond ==> cần chuyển sang moth hour in a day .....s

                  return (
                    <tr
                      // key: Giúp React quản lý danh sách (bắt buộc phải có và duy nhất)
                      key={`${item.MaPhieuNhap}-${item.TenThuoc}-${index}`}
                      // Style động:
                      // - opacity: Nếu hết hàng (isSoldOut) thì làm mờ đi (0.5), còn không thì rõ (1)
                      // - backgroundColor: Nếu hết hàng thì nền xám nhẹ, còn không thì trắng
                      style={{
                        opacity: isSoldOut ? 0.5 : 1,
                        backgroundColor: isSoldOut ? "#f9f9f9" : "white",
                      }}
                    >
                      {/* Cột 1: Mã phiếu */}
                      <td>{item.MaPhieuNhap}</td>

                      {/* Cột 2: Ngày nhập (dùng hàm formatDate đã viết ở trên) */}
                      <td>{formatDate(item.NgayNhap)}</td>

                      {/* Cột 3: Tên thuốc (in đậm nhẹ 500) */}
                      <td style={{ fontWeight: "500" }}>{item.TenThuoc}</td>

                      {/* Cột 4: Nhà cung cấp */}
                      <td>{item.TenNhaCungCap}</td>

                      {/* Cột 5: Số lượng nhập ban đầu */}
                      <td className={styles.numberCell}>{item.SoLuongNhap}</td>

                      {/* Cột 6: Số lượng còn lại (QUAN TRỌNG) */}
                      <td
                        className={styles.numberCell}
                        style={{
                          fontWeight: "bold",
                          // Logic màu chữ: Hết hàng -> Màu xám (#999). Còn hàng -> Màu xanh lá (#2ecc71)
                          color: isSoldOut ? "#999" : "#2ecc71",
                        }}
                      >
                        {item.SoLuongConLai}
                      </td>

                      {/* Cột 7: Giá nhập (dùng hàm formatCurrency để thêm chữ 'đ') */}
                      <td className={styles.numberCell}>
                        {formatCurrency(item.DonGiaNhap)}
                      </td>

                      {/* Cột 8: Hạn sử dụng */}
                      <td
                        style={{
                          // Logic màu chữ: Nếu chưa bán hết MÀ sắp hết hạn -> Màu đỏ (#e74c3c). Còn lại bình thường.
                          color:
                            !isSoldOut && isExpiringSoon
                              ? "#e74c3c"
                              : "inherit",

                          // Logic độ đậm: Sắp hết hạn thì in đậm lên cảnh báo
                          fontWeight:
                            !isSoldOut && isExpiringSoon ? "bold" : "normal",
                        }}
                      >
                        {formatDate(item.HanSuDung)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Nếu danh sách rỗng (history.length = 0), hiện thông báo này
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Chưa có dữ liệu nhập kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- CỬA SỔ BẬT LÊN (MODAL) --- */}
      {/* Cái này bị ẩn đi, chỉ hiện khi biến isModalOpen = true */}
      <ModalWithAnimation
        title="Tạo Phiếu Nhập Mới"
        isOpen={isModalOpen} // Truyền trạng thái Mở/Đóng vào
        onClose={() => setIsModalOpen(false)} // Truyền hàm để đóng cửa sổ
        customClass={modalStyles.modalLarge}
      >
        {/* Nội dung bên trong cửa sổ là cái Form nhập liệu */}
        <PhieuNhapForm
          onClose={() => setIsModalOpen(false)} // Form cũng cần quyền đóng cửa sổ
          onSave={handleSaveSuccess} // Khi Form lưu xong thì gọi hàm này
        />
      </ModalWithAnimation>
    </div>
  );
};
