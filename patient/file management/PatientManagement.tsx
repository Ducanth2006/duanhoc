// --- PHẦN 1: NHẬP KHẨU NGUYÊN LIỆU (IMPORTS) ---
// Giống như khi nấu ăn, bạn cần chuẩn bị nguyên liệu trước.
// Ở đây, chúng ta lấy các công cụ cần thiết từ các "kho" khác nhau.

// 1. Lấy 'React' (để tạo giao diện) và các 'Hook' (công cụ đặc biệt):
// - useState: Giúp component có "trí nhớ" (lưu trữ dữ liệu).
// - useEffect: Giúp component biết làm gì sau khi hiện lên (như tự động tải dữ liệu).
import React, { useState, useEffect } from 'react';

// 2. Lấy khuôn mẫu dữ liệu (Interface).
// 'BenhNhan' là một bản mô tả xem một bệnh nhân gồm những thông tin gì (tên, tuổi, v.v.).
// Giúp code không bị nhầm lẫn kiểu dữ liệu (ví dụ: tên phải là chữ, không được là số).
import { BenhNhan } from '../../interfaces';

// 3. Lấy các hàm để gọi về Server (API).
// - getPatients: Hàm đi lấy danh sách bệnh nhân từ cơ sở dữ liệu (CSDL).
// - deletePatient: Hàm ra lệnh xóa một bệnh nhân khỏi CSDL.
import { getPatients, deletePatient } from '../../api/benhNhanApi';

// 4. Lấy các Component con (những mảnh ghép nhỏ hơn).
// - PatientForm: Cái biểu mẫu để điền thông tin bệnh nhân.
// - Modal: Cái hộp thoại bật lên giữa màn hình (popup).
import { PatientForm } from '../../components/AdminForms/PatientForm';
import Modal from '../../components/common/Modal';

// 5. Lấy file trang trí (CSS) để giao diện đẹp hơn.
import styles from '../../styles/AdminManagement.module.css';

// --- PHẦN 2: ĐỊNH NGHĨA COMPONENT (CỖ MÁY CHÍNH) ---
// Đây là nơi chúng ta tạo ra "cỗ máy" PatientManagement.
// 'const' là khai báo một hằng số (cái tên).
// 'React.FC' nghĩa là "Functional Component" (Thành phần dạng hàm) của React.
const PatientManagement: React.FC = () => {

  // --- KHU VỰC "TRÍ NHỚ" CỦA COMPONENT (STATE) ---
  // Mỗi dòng useState tạo ra một biến để lưu trữ thông tin.
  // Khi thông tin này thay đổi, giao diện sẽ tự động cập nhật (render lại).

  // 1. 'patients': Lưu danh sách bệnh nhân lấy được. Ban đầu là rỗng [].
  // 'setPatients': Là cái công tắc để thay đổi danh sách này.
  const [patients, setPatients] = useState<BenhNhan[]>([]);

  // 2. 'isLoading': Lưu trạng thái "đang tải".
  // Ban đầu là 'true' (đang quay vòng tròn chờ tải), tải xong ta sẽ bật thành 'false'.
  const [isLoading, setIsLoading] = useState(true);

  // 3. 'error': Lưu thông báo lỗi nếu có chuyện gì xảy ra (ví dụ mất mạng).
  // Ban đầu là 'null' (không có lỗi).
  const [error, setError] = useState<string | null>(null);

  // 4. 'isModalOpen': Lưu trạng thái cái hộp thoại (popup) đang mở hay đóng.
  // false = đóng, true = mở.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 5. 'selectedPatient': Lưu thông tin người bệnh đang được chọn để sửa.
  // Nếu là null nghĩa là chưa chọn ai (hoặc đang muốn thêm mới).
  const [selectedPatient, setSelectedPatient] = useState<BenhNhan | null>(null);

  // --- HÀM XỬ LÝ: TẢI DỮ LIỆU ---
  // 'async' nghĩa là hàm này làm việc bất đồng bộ (cần thời gian chờ, không xong ngay lập tức).
  const loadPatients = async () => {
    try {
      // Bắt đầu tải: bật trạng thái đang tải, xóa lỗi cũ.
      setIsLoading(true);
      setError(null);

      // 'await': Bảo máy tính "Đợi chút! Gọi hàm getPatients lấy dữ liệu xong đã rồi mới chạy dòng tiếp".
      const data = await getPatients();

      // Có dữ liệu rồi, lưu vào "trí nhớ" (state) patients.
      setPatients(data);
    } catch (err) {
      // Nếu có lỗi (ví dụ server sập), nhảy vào đây và lưu lỗi lại để hiện ra màn hình.
      setError((err as Error).message);
    } finally {
      // Dù thành công hay thất bại, cuối cùng cũng phải tắt trạng thái "đang tải".
      setIsLoading(false);
    }
  };

  // --- HIỆU ỨNG (EFFECT) ---
  // useEffect giống như một cái cò súng, nó sẽ tự nổ khi component xuất hiện lần đầu tiên.
  // [] rỗng ở cuối nghĩa là "Chỉ chạy 1 lần duy nhất khi vừa vào trang".
  // Tác dụng: Vừa vào trang là gọi ngay hàm loadPatients để lấy dữ liệu hiển thị.
  useEffect(() => {
    loadPatients();
  }, []);

  // --- HÀM XỬ LÝ: MỞ HỘP THOẠI (MODAL) ---
  // Hàm này chạy khi bấm nút "Sửa" hoặc "Thêm".
  const handleOpenModal = (patient: BenhNhan | null) => {
    setSelectedPatient(patient); // Lưu người được chọn vào bộ nhớ.
    setIsModalOpen(true);        // Bật công tắc mở Modal lên.
  };

  // --- HÀM XỬ LÝ: ĐÓNG HỘP THOẠI ---
  const handleCloseModal = () => {
    setIsModalOpen(false);       // Tắt Modal.
    setSelectedPatient(null);    // Xóa người được chọn đi (reset).
  };

  // --- HÀM XỬ LÝ: KHI LƯU THÀNH CÔNG ---
  // Chạy khi form trong Modal bấm nút Lưu xong xuôi.
  const handleSave = () => {
    handleCloseModal(); // Đóng Modal lại.
    loadPatients();     // Tải lại danh sách mới nhất từ server (để thấy thay đổi).
  };

  // --- HÀM XỬ LÝ: XÓA BỆNH NHÂN ---
  // Nhận vào 'maBenhNhan' (ID) để biết cần xóa ai.
  const handleDelete = async (maBenhNhan: string) => {
    // Hỏi người dùng cho chắc ăn (window.confirm hiện bảng Yes/No của trình duyệt).
    if (window.confirm('Bạn có chắc muốn xóa bệnh nhân này?')) {
      try {
        // Gọi API xóa lên server và đợi ('await') nó xóa xong.
        await deletePatient(maBenhNhan);
        alert('Đã xóa thành công!'); // Thông báo.
        loadPatients(); // Tải lại danh sách (để dòng đó biến mất khỏi bảng).
      } catch (err) {
        alert('Lỗi khi xóa: ' + (err as Error).message);
      }
    }
  };

  // --- HÀM PHỤ TRỢ: VẼ NỘI DUNG BẢNG ---
  // Hàm này quyết định xem sẽ hiển thị cái gì trong thân bảng (tbody).
  const renderContent = () => {
    // 1. Nếu đang tải -> Hiện dòng chữ "Đang tải..."
    if (isLoading) {
      // colSpan={7}: Ô này gộp 7 cột lại làm 1 cho rộng.
      return <tr><td colSpan={7}>Đang tải dữ liệu, vui lòng chờ...</td></tr>;
    }
    // 2. Nếu có lỗi -> Hiện dòng chữ màu đỏ báo lỗi.
    if (error) {
      return <tr><td colSpan={7} style={{ color: 'red' }}>Lỗi: {error}</td></tr>;
    }
    // 3. Nếu danh sách rỗng -> Báo không có dữ liệu.
    if (patients.length === 0) {
      return <tr><td colSpan={7}>Không tìm thấy dữ liệu bệnh nhân.</td></tr>;
    }

    // 4. Nếu mọi thứ OK -> Dùng hàm .map() để "biến hình" từng cục dữ liệu bệnh nhân thành các dòng HTML (tr)
    // 'p' ở đây đại diện cho từng người bệnh nhân (patient).
    return patients.map((p) => (
      // 'key': React cần cái này để quản lý danh sách, nó phải là duy nhất (như CMND).
      <tr key={p.MaBenhNhan}>
        {/* Hiển thị từng cột dữ liệu */}
        <td>{p.MaBenhNhan}</td>
        <td>{p.TenBenhNhan}</td>
        {/* Xử lý ngày tháng cho dễ đọc (tiếng Việt) */}
        <td>{new Date(p.NgaySinh).toLocaleDateString()}</td>
        <td>{p.GioiTinh}</td>
        <td>{p.SoDienThoai}</td>
        <td>{p.DiaChi}</td>
        <td>
          {/* Nút Sửa: Khi click sẽ gọi hàm mở Modal và đưa thông tin người 'p' này vào */}
          <button onClick={() => handleOpenModal(p)} className={styles.editButton}>Sửa</button>
          
          {/* Bạn có thể thêm nút Xóa ở đây nếu muốn, dùng hàm handleDelete */}
        </td>
      </tr>
    ));
  };

  // --- PHẦN 3: GIAO DIỆN TRẢ VỀ (RETURN) ---
  // Đây là phần HTML (viết kiểu JSX) mà người dùng sẽ nhìn thấy trên màn hình.
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản lý Bệnh nhân</h1>
      
      {/* Nút Thêm mới (đang bị ẩn - comment). Nếu muốn hiện thì bỏ dấu comment ra */}
      {/* <button onClick={() => handleOpenModal(null)} className={styles.addButton}>
        Thêm bệnh nhân mới
      </button> */}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã BN</th>
            <th>Tên Bệnh nhân</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {/* Gọi hàm renderContent ở trên để nó nhả ra các dòng dữ liệu */}
          {renderContent()}
        </tbody>
      </table>

      {/* COMPONENT MODAL:
        Đây là cái hộp thoại bật lên.
        - isOpen: Bảo nó mở hay đóng (dựa vào biến nhớ isModalOpen).
        - onClose: Bảo nó làm gì khi người dùng bấm tắt.
        - title: Tự động đổi tên tiêu đề tùy vào việc đang Sửa hay Thêm.
      */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedPatient ? 'Sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
      >
        {/* Bên trong Modal là cái Form điền thông tin */}
        <PatientForm
          patient={selectedPatient} // Truyền thông tin người cần sửa vào form (nếu có)
          onSave={handleSave}       // Bảo form làm gì khi lưu xong (gọi handleSave)
          onClose={handleCloseModal} // Bảo form làm gì khi bấm hủy
        />
      </Modal>
    </div>
  );
};

// Xuất component này ra để các file khác (như App.tsx) có thể sử dụng.
export default PatientManagement;