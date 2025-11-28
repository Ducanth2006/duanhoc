// --- PHẦN 1: NHẬP KHẨU (IMPORTS) ---
import React, { useState, useEffect } from "react";
// Lấy khuôn mẫu dữ liệu Nhà Cung Cấp (NCC)
import { NhaCungCap } from "../../interfaces";
// Lấy các hàm gọi server: Lấy ds, Xóa
import { getNhaCungCap, deleteNhaCungCap } from "../../api/nhaCungCapApi";
// Lấy các thành phần giao diện (Modal, CSS, Form)
import Modal from "../../components/common/Modal";
import styles from "../../styles/AdminManagement.module.css";
import { NhaCungCapForm } from "../../components/AdminForms/NhaCungCapForm";

const NhaCungCapManagement: React.FC = () => {
  // --- PHẦN 2: TRÍ NHỚ (STATE) ---

  // 1. Danh sách NCC. Ban đầu là mảng rỗng [].
  const [suppliers, setSuppliers] = useState<NhaCungCap[]>([]);

  // 2. Trạng thái đang tải dữ liệu (quay vòng tròn).
  const [isLoading, setIsLoading] = useState(true);

  // 3. Lưu lỗi nếu có (mất mạng, server lỗi...).
  const [error, setError] = useState<string | null>(null);

  // 4. Trạng thái mở/đóng cái bảng Popup (Modal).
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 5. Lưu thông tin NCC đang được chọn để Sửa. (null nếu là Thêm mới).
  const [selectedSupplier, setSelectedSupplier] = useState<NhaCungCap | null>(
    null
  );

  // --- HÀM TẢI DỮ LIỆU ---
  const loadSuppliers = async () => {
    try {
      setIsLoading(true); // Bắt đầu tải -> Bật loading
      setError(null); // Xóa lỗi cũ

      // Gọi điện lên server lấy danh sách (await: đợi lấy xong mới đi tiếp)
      const data = await getNhaCungCap();

      // Có dữ liệu rồi -> Lưu vào trí nhớ
      setSuppliers(data);
    } catch (err) {
      // Nếu lỗi -> Lưu lỗi để hiện ra màn hình
      setError((err as Error).message);
    } finally {
      // Dù thành công hay thất bại -> Tắt loading
      setIsLoading(false);
    }
  };

  // --- HIỆU ỨNG KHỞI ĐỘNG (USE EFFECT) ---
  // Chạy 1 lần duy nhất khi vừa vào trang này.
  useEffect(() => {
    loadSuppliers();
  }, []);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN (HANDLERS) ---

  // Mở Modal: Nếu truyền vào 'supplier' thì là Sửa, nếu null thì là Thêm.
  const handleOpenModal = (supplier: NhaCungCap | null) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  // Đóng Modal và xóa dữ liệu tạm.
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  // Khi form lưu thành công -> Đóng Modal -> Tải lại danh sách mới nhất.
  const handleSave = () => {
    handleCloseModal();
    loadSuppliers();
  };

  // Hàm Xóa:
  const handleDelete = async (maNhaCungCap: string) => {
    // Hỏi người dùng cho chắc chắn (Confirm dialog của trình duyệt)
    if (window.confirm("Bạn có chắc chắn muốn xóa Nhà cung cấp này?")) {
      try {
        // Gọi API xóa và đợi kết quả
        await deleteNhaCungCap(maNhaCungCap);
        // Xóa xong thì tải lại danh sách để cập nhật bảng
        loadSuppliers();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  // Hàm vẽ nội dung bảng (tách ra cho code gọn)
  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className={styles.loadingCell}>
            Đang tải...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={6} className={styles.errorCell}>
            {error}
          </td>
        </tr>
      );
    }
    // Nếu danh sách rỗng
    if (suppliers.length === 0) {
      return (
        <tr>
          <td colSpan={6} className={styles.emptyCell}>
            Không có dữ liệu nhà cung cấp.
          </td>
        </tr>
      );
    }

    // Biến đổi (map) từng cục dữ liệu thành các dòng HTML (tr)
    return suppliers.map((item) => (
      <tr key={item.MaNhaCungCap}>
        {" "}
        {/* Key giúp React quản lý danh sách hiệu quả */}
        <td>{item.MaNhaCungCap}</td>
        <td>{item.TenNhaCungCap}</td>
        <td>{item.DiaChi}</td>
        <td>{item.SoDienThoai}</td>
        <td>{item.Email}</td>
        <td className={styles.actionButtons}>
          {/* Nút Sửa: Bấm vào thì mở Modal với thông tin NCC này */}
          <button
            onClick={() => handleOpenModal(item)}
            className={styles.editButton}
          >
            Sửa
          </button>

          {/* Nút Xóa: Bấm vào thì gọi hàm xóa */}
          <button
            onClick={() => handleDelete(item.MaNhaCungCap)}
            className={styles.deleteButton}
          >
            Xóa
          </button>
        </td>
      </tr>
    ));
  };

  // --- PHẦN 3: GIAO DIỆN HIỂN THỊ (RETURN JSX) ---
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Quản lý Nhà Cung Cấp</h1>

        {/* Nút Thêm mới to đùng ở trên cùng */}
        <button
          onClick={() => handleOpenModal(null)}
          className={styles.addButton}
        >
          Thêm Nhà Cung Cấp
        </button>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Mã NCC</th>
              <th className={styles.tableHeader}>Tên Nhà Cung Cấp</th>
              <th className={styles.tableHeader}>Địa chỉ</th>
              <th className={styles.tableHeader}>Số điện thoại</th>
              <th className={styles.tableHeader}>Email</th>
              <th className={styles.tableHeader}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* Gọi hàm renderContent ở trên để nhả ra các dòng dữ liệu */}
            {renderContent()}
          </tbody>
        </table>
      </div>

      {/* COMPONENT MODAL (Cửa sổ bật lên) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        // Đổi tên tiêu đề linh hoạt: Đang sửa thì hiện "Sửa...", đang thêm thì hiện "Thêm..."
        title={selectedSupplier ? "Sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp"}
      >
        {/* Nhúng cái Form vào trong Modal */}
        <NhaCungCapForm
          supplier={selectedSupplier} // Truyền dữ liệu cần sửa (nếu có)
          onSave={handleSave} // Báo cho cha biết khi lưu xong
          onClose={handleCloseModal} // Báo cho cha biết khi bấm hủy
        />
      </Modal>
    </>
  );
};

export default NhaCungCapManagement;
