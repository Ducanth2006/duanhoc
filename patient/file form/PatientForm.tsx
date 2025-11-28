// --- PHẦN 1: NHẬP NGUYÊN LIỆU ---
import React, { useState } from 'react';
import { BenhNhan } from '../../interfaces';
// Nhập 2 hàm API: 'add' (thêm mới) và 'update' (cập nhật/sửa)
import { addPatient, updatePatient } from '../../api/benhNhanApi';
import styles from '../../styles/Form.module.css';

// --- PHẦN 2: ĐỊNH NGHĨA "HỢP ĐỒNG" (INTERFACE) ---
// Đây là bản quy định: Component cha (PatientManagement) muốn dùng cái Form này
// thì BẮT BUỘC phải truyền đủ 3 thứ sau đây:
interface PatientFormProps {
  patient: BenhNhan | null; // Dữ liệu bệnh nhân cần sửa (nếu thêm mới thì là null)
  onSave: () => void;       // Hàm để báo cho cha biết "Em lưu xong rồi nhé!"
  onClose: () => void;      // Hàm để báo cho cha biết "Tắt em đi!"
}

// Hàm phụ trợ nhỏ: Lấy ngày hôm nay theo định dạng "YYYY-MM-DD" để điền sẵn vào ô ngày tháng.
//.toISOString() nó trả về "2025-11-26T02:30:00.000Z" do đó ta chỉ cần ngày thôi suy ra cắt ra thành 1 mảng 2 phần tử
//  , ta sủ dụng[0]lấy cái đầu là ngày
const getTodayString = () => new Date().toISOString().split('T')[0];

// --- PHẦN 3: COMPONENT CHÍNH (CÁI MÁY FORM) ---
export const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onClose }) => {
  
  // --- TRÍ NHỚ 1: Dữ liệu Form (formData) ---
  // Đây là nơi lưu tạm những gì người dùng đang gõ vào các ô input.
  // Khởi tạo (giá trị ban đầu):
  // - Nếu có 'patient' (đang sửa) -> Lấy thông tin của người đó điền vào.
  // - Nếu không (đang thêm mới) -> Điền rỗng '' hoặc mặc định.
  const [formData, setFormData] = useState<Partial<BenhNhan>>({
    TenBenhNhan: patient?.TenBenhNhan || '', // Dấu || nghĩa là "nếu cái trước không có thì lấy cái sau"
    NgaySinh: patient?.NgaySinh ? patient.NgaySinh.split('T')[0] : getTodayString(),
    GioiTinh: patient?.GioiTinh || 'Nam',
    SoDienThoai: patient?.SoDienThoai || '',
    DiaChi: patient?.DiaChi || '',
  });

  // --- TRÍ NHỚ 2 & 3: Trạng thái phụ ---
  // isSubmitting: Đang gửi dữ liệu đi chưa? (để làm mờ nút Lưu, tránh bấm nhiều lần)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // formError: Có lỗi gì không? (ví dụ: quên điền tên)
  const [formError, setFormError] = useState<string | null>(null);

  // --- HÀM XỬ LÝ: KHI NGƯỜI DÙNG GÕ PHÍM (CHANGE) ---
  // Hàm này chạy mỗi khi bạn gõ 1 ký tự vào bất kỳ ô input nào.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // Lấy tên ô input (name) và giá trị vừa gõ (value)
    
    // Cập nhật vào bộ nhớ formData
    setFormData((prev) => ({
      ...prev,        // Giữ nguyên các thông tin cũ (copy lại)
      [name]: value,  // Chỉ thay đổi thông tin đang gõ (ví dụ: chỉ sửa SoDienThoai)
    }));
  };

  // --- HÀM XỬ LÝ: KHI BẤM NÚT LƯU (SUBMIT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn hành động mặc định (tránh việc trang web bị load lại - F5)

    // 1. Kiểm tra dữ liệu (Validate)
    if (!formData.TenBenhNhan) {
      setFormError('Vui lòng nhập tên bệnh nhân');
      return; // Dừng lại, không làm tiếp
    }

    try {
      setIsSubmitting(true); // Bật chế độ "Đang gửi..."
      setFormError(null);    // Xóa lỗi cũ đi

      // 2. Quyết định xem là Thêm mới hay Sửa
      if (patient) {
        // Nếu có thông tin 'patient' ban đầu -> Đang Sửa -> Gọi API update
        // (Dùng 'as BenhNhan' để khẳng định với TypeScript là dữ liệu đã đủ)
        await updatePatient(patient.MaBenhNhan, formData as BenhNhan);
        alert('Cập nhật thành công!');
      } else {
        // Nếu không có -> Đang Thêm mới -> Gọi API add
        await addPatient(formData as BenhNhan);
        alert('Thêm mới thành công!');
      }

      // 3. Báo cáo hoàn thành
      onSave(); // Gọi điện cho cha: "Xong rồi cha ơi, tải lại danh sách đi!"
    } catch (err) {
      // Nếu lỗi mạng hoặc server lỗi -> Hiện thông báo đỏ
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false); // Tắt chế độ "Đang gửi..."
    }
  };

  // --- PHẦN 4: GIAO DIỆN (HTML/JSX) ---
  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* Ô nhập Tên */}
      <div className={styles.formGroup}>
        <label htmlFor="TenBenhNhan">Tên Bệnh nhân</label>
        <input
          type="text"
          id="TenBenhNhan"
          name="TenBenhNhan"        // Quan trọng: name phải khớp với tên biến trong formData
          value={formData.TenBenhNhan} // Liên kết 2 chiều: Input hiển thị giá trị từ state
          onChange={handleChange}      // Khi gõ thì cập nhật state
          placeholder="Nhập họ tên đầy đủ"
        />
      </div>

      {/* Ô chọn Ngày sinh */}
      <div className={styles.formGroup}>
        <label htmlFor="NgaySinh">Ngày sinh</label>
        <input
          type="date"
          id="NgaySinh"
          name="NgaySinh"
          value={formData.NgaySinh}
          onChange={handleChange}
        />
      </div>
      
      {/* Ô chọn Giới tính (Dropdown) */}
      <div className={styles.formGroup}>
        <label htmlFor="GioiTinh">Giới tính</label>
         <select
          id="GioiTinh"
          name="GioiTinh"
          value={formData.GioiTinh}
          onChange={handleChange}
        >
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      {/* Ô nhập Số điện thoại */}
      <div className={styles.formGroup}>
        <label htmlFor="SoDienThoai">Số điện thoại</label>
        <input
          type="tel"
          id="SoDienThoai"
          name="SoDienThoai"
          value={formData.SoDienThoai}
          onChange={handleChange}
        />
      </div>

      {/* Ô nhập Địa chỉ (Textarea - ô to) */}
      <div className={styles.formGroup}>
        <label htmlFor="DiaChi">Địa chỉ</label>
        <textarea
          id="DiaChi"
          name="DiaChi"
          value={formData.DiaChi}
          onChange={handleChange}
          rows={3}
        />
      </div>

      {/* Khu vực hiện Lỗi (nếu có) - chỉ hiện khi formError khác null */}
      {formError && (
        <div className={styles.errorText}>
          {formError}
        </div>
      )}

      {/* Khu vực Nút bấm */}
      <div className={styles.buttonGroup}>
        {/* Nút Lưu: bị mờ (disabled) khi đang gửi dữ liệu */}
        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </button>
        
        {/* Nút Hủy: bấm thì gọi hàm onClose để đóng Form */}
        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>
          Hủy
        </button>
      </div>
    </form>
  );
};