// PART 1

// src/pages/Admin/MedicineManagement.tsx
import React, { useState, useEffect } from "react";
import { Thuoc } from "../../interfaces"; //
import { getMedicines, deleteMedicine } from "../../api/thuocApi";
import { MedicineForm } from "../../components/AdminForms/MedicineForm";
import Modal from "../../components/common/Modal";
import styles from "../../styles/AdminManagement.module.css";
/*đây là dòng khai báo một Component trong React sử dụng TypeScript.
: React.FC là :
Nó giống như một cái "giấy chứng nhận": "Tôi xác nhận cái biến MedicineManagement này chuẩn là một Component của React, chứ không phải là số, chuỗi hay hàm tào lao nào đó".
Nhờ cái nhãn này, khi bạn dùng component, máy tính sẽ gợi ý cho bạn các thuộc tính có sẵn của React như children, key, ref...
*/
const MedicineManagement: React.FC = () => {
  /* usestate là useState giúp em kích hoạt cơ chế cập nhật giao diện của React mỗi khi dữ liệu thay đổi, đảm bảo người dùng luôn nhìn thấy thông tin mới nhất ạ"
 nó sẽ trả về một mảng gồm 2 phần dữ liệu , method để thay đổi dữ liệu đó*/
  // mới cái trong <.. > là của type script Thưa thầy, đây là Generic trong TypeScript ạ. Em dùng nó để định nghĩa kiểu dữ liệu đầu ra và đầu vào cho state.
  // tác dụng generic Dạ, Generic giúp em tạo ra sự ràng buộc chặt chẽ về dữ liệu
  const [medicines, setMedicines] = useState<Thuoc[]>([]); //Array Destructuring, <Thuoc[]> là  (TypeScript Generic),THUOC là interface
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Thuoc | null>(null);
  // END PART 1

  const loadMedicines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleOpenModal = (medicine: Thuoc | null) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedicine(null);
  };

  const handleSave = () => {
    handleCloseModal();
    loadMedicines(); // Tải lại danh sách sau khi lưu
  };

  const handleDelete = async (maThuoc: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thuốc này?")) {
      try {
        await deleteMedicine(maThuoc);
        loadMedicines(); // Tải lại danh sách
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  // Hàm render nội dung bảng
  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className={styles.loadingCell}>
            Đang tải...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={8} className={styles.errorCell}>
            {error}
          </td>
        </tr>
      );
    }
    if (medicines.length === 0) {
      return (
        <tr>
          <td colSpan={8} className={styles.emptyCell}>
            Không có dữ liệu thuốc.
          </td>
        </tr>
      );
    }

    return medicines.map((med) => (
      <tr key={med.MaThuoc}>
        <td>{med.MaThuoc}</td>
        <td>{med.TenThuoc}</td>
        {/* [MỚI] Thêm cột Tên Loại (lấy từ join) */}
        <td>{med.TenLoai || "N/A"}</td>
        {/* [MỚI] Thêm cột Tên Nhà Cung Cấp (lấy từ join) */}
        <td>{med.TenNhaCungCap || "N/A"}</td>
        <td>{med.SoLuongTon}</td>
        <td>{med.DonViTinh}</td>
        {/* Định dạng lại giá bán cho dễ đọc */}
        <td>{med.GiaBan.toLocaleString("vi-VN")} VNĐ</td>
        <td className={styles.actionButtons}>
          <button
            onClick={() => handleOpenModal(med)}
            className={styles.editButton}
          >
            Sửa
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Quản lý Danh sách thuốc</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className={styles.addButton}
        >
          Thêm thuốc mới
        </button>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Mã Thuốc</th>
              <th className={styles.tableHeader}>Tên Thuốc</th>
              {/* [MỚI] Thêm cột header Tên Loại */}
              <th className={styles.tableHeader}>Tên Loại</th>
              {/* [MỚI] Thêm cột header Tên NCC */}
              <th className={styles.tableHeader}>Tên NCC</th>
              <th className={styles.tableHeader}>Số lượng tồn</th>
              <th className={styles.tableHeader}>Đơn vị</th>
              <th className={styles.tableHeader}>Giá bán</th>
              <th className={styles.tableHeader}>Hành động</th>
            </tr>
          </thead>
          <tbody>{renderContent()}</tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedMedicine ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
      >
        <MedicineForm
          medicine={selectedMedicine}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      </Modal>
    </>
  );
};

export default MedicineManagement;
