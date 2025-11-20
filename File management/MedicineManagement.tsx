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
  const [selectedMedicine, setSelectedMedicine] = useState<Thuoc | null>(null); // thuoc ở đây là interface

  // END PART 1
  // Part2 UseEffect

  /*Từ khóa async báo hiệu cho JavaScript biết: "Hàm này là một nhiệm vụ bất đồng bộ (có thể phải chờ đợi), hãy sẵn sàng dùng await bên trong nó." */
  const loadMedicines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMedicines(); // await thông báo là dừng chạy code đợi code này chạy xong, lệnh lấy api
      setMedicines(data); //kích hoạt chế độ render vẽ lại
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  /*useEffect là tác vụ phụ, có tác dụng giúp trình duyệt không bị đơ khi đang tải dữ liệu.
   Nó sẽ chờ vẽ các giao diện xong rồi mới thực hiện tác vụ phụ (gọi API), vì vậy nó không gây đứng trang (non-blocking).
   nó có 2 tham số :
   + Tham số thứ nhất: HÀNH ĐỘNG (The Action) Thời điểm chạy: Sẽ được React chạy sau khi Component được vẽ lên màn hình (và sau đó là theo quy tắc của Tham số 2).
   + Tham số thứ hai: ĐIỀU KIỆN KÍCH HOẠT sau khi đã chạy 1 lần  (The Dependency Array) Nhiệm vụ: Quyết định khi nào Tham số 1 được chạy lại. Nó xem cần theo dõi cái nào để chạy cái thứ 1 
     ,CHú ý nếu để trống không điền  thì sẽ là theo dõi tất cả => có thay đổi lại gọi lại api   */
  useEffect(() => {
    loadMedicines();
  }, []);

  const handleOpenModal = (medicine: Thuoc | null) => {
    //nếu là Null thì là mở form thêm mới , nếu là thuoc thì mở form
    setSelectedMedicine(medicine); // medicine ở đây là med ở bên dưới nhé
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // đóng cái modal lại
    setSelectedMedicine(null);
    /* dọn dẹp dữ liệu giúp Nếu không có dòng này: Lần sau bạn bấm "Thêm thuốc mới", selectedMedicine vẫn còn giữ thông tin của viên thuốc vừa sửa xong
      -> Form thêm mới lại hiện ra thông tin cũ -> BUG.*/
  };

  // hàm save này để cho thằng con là form dùng
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
        /*"Giải thích dòng setError((err as Error).message)!"

       Bạn trả lời: "Dạ thưa thầy, dòng này được dùng để lưu thông báo lỗi vào State của component.

      err là đối tượng lỗi được bắt bởi khối catch.

      (err as Error) là kỹ thuật Ép kiểu của TypeScript (Type Assertion), nó giúp em chắc chắn rằng err là một đối tượng Error, 
       từ đó em có thể an toàn truy cập vào thuộc tính .message(ở file apithuoc) để lấy nội dung lỗi dưới dạng chuỗi.

      Cuối cùng, em dùng setError() để cập nhật chuỗi lỗi đó vào state error, việc này kích hoạt React vẽ lại giao diện cho người dùng biết */
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
