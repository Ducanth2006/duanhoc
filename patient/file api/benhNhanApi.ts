// --- PHẦN 1: KHỞI TẠO ---
// Nhập cái "khuôn" BenhNhan để biết dữ liệu trông như thế nào.
import { BenhNhan } from '../interfaces';

// Đây là địa chỉ "nhà kho" (Server Backend) của bạn.
// Mọi yêu cầu (lấy, thêm, sửa, xóa) đều bắt đầu từ địa chỉ này.
const API_BASE_URL = '/api/v1/benhnhan';

// --- PHẦN 2: HÀM LẤY DANH SÁCH (GET) ---
// export: Để các file khác (như PatientManagement) có thể lấy hàm này ra dùng.
// async: Vì việc đi lấy hàng mất thời gian, nên phải dùng hàm bất đồng bộ.
// Promise<BenhNhan[]>: Lời hứa rằng "Tý nữa xong việc, tớ sẽ trả về một Mảng các Bệnh nhân".
export const getPatients = async (): Promise<BenhNhan[]> => {
  
  // 'fetch': Là lệnh sai người đi lấy hàng.
  // Mặc định fetch là phương thức GET (chỉ xem/lấy về).
  const response = await fetch(API_BASE_URL); 

  // Kiểm tra xem server có trả lời OK không?
  // !response.ok nghĩa là có lỗi (ví dụ lỗi 404, 500 server sập).
  if (!response.ok) {
    // Nếu lỗi, hét lớn lên (throw Error) để bên file kia biết mà hiện thông báo đỏ.
    throw new Error('Không thể tải danh sách bệnh nhân');
  }

  // Nếu OK, dữ liệu trả về đang ở dạng text thô (JSON).
  // Cần dùng .json() để "dịch" nó sang dạng JavaScript Object (Mảng) mà code hiểu được.
  return await response.json();
};

// --- PHẦN 3: HÀM CẬP NHẬT (PUT) ---
// Hàm này cần 2 thứ: 
// 1. 'maBenhNhan': Để biết sửa ai.
// 2. 'data': Những thông tin mới cần lưu.
export const updatePatient = async (maBenhNhan: string, data: Partial<BenhNhan>): Promise<BenhNhan> => {
  
  // --- CHUẨN BỊ DỮ LIỆU ---
  // Backend (người nhận) thường rất khó tính, họ muốn nhận dữ liệu đúng y hệt tên họ quy định.
  // Đoạn code này giống như việc đóng gói hàng hóa cẩn thận trước khi gửi.
  const dataForBackend = {
    MaBenhNhan: maBenhNhan,          // Lấy mã từ tham số truyền vào
    TenBenhNhan: data.TenBenhNhan,   // Lấy tên từ dữ liệu form
    NgaySinh: data.NgaySinh,         
    GioiTinh: data.GioiTinh,         
    SoDienThoai: data.SoDienThoai,   
    DiaChi: data.DiaChi              
  };

  // Gửi đi!
  // URL: Cộng thêm đuôi "/fix" vì Backend quy định đường đi này dành cho việc sửa.
  const response = await fetch(`${API_BASE_URL}/fix`, {
    method: 'PUT', // PUT: Hành động cập nhật/ghi đè.
    headers: {
      // Cái nhãn dán lên gói hàng, bảo server là: "Ê, bên trong là dữ liệu JSON nhé!"
      'Content-Type': 'application/json',
    },
    // body: Nội dung gói hàng.
    // JSON.stringify: Biến object JS thành chuỗi text để có thể gửi qua mạng internet.
    body: JSON.stringify(dataForBackend), 
  });

  // Kiểm tra xem server nhận hàng có vui vẻ không
  if (!response.ok) {
    const errorData = await response.json(); // Đọc lý do lỗi từ server
    throw new Error(errorData.message || 'Cập nhật thất bại'); // Báo lỗi
  }
  
  const result = await response.json(); // Lấy kết quả server trả về
  
  // Trả về dữ liệu đã sửa xong cho bên Giao diện cập nhật lại bảng
  // 'as BenhNhan': Đóng dấu khẳng định "Đây chuẩn là kiểu BenhNhan rồi nhé".
  return { ...data, MaBenhNhan: maBenhNhan } as BenhNhan;
};

// --- PHẦN 4: HÀM XÓA (DELETE) ---
export const deletePatient = async (maBenhNhan: string): Promise<void> => {
  // Gọi điện lên server bảo: "Xóa cái ông có mã này đi!"
  // URL: nối thêm mã vào đường dẫn, ví dụ: .../delete/BN001
  const response = await fetch(`${API_BASE_URL}/delete/${maBenhNhan}`, {
    method: 'DELETE', // DELETE: Hành động xóa.
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Xóa thất bại');
  }
  // Xóa xong thì thôi, không cần trả về dữ liệu gì (Promise<void>)
};

// --- PHẦN 5: HÀM THÊM MỚI (POST) ---
// Omit<BenhNhan, 'MaBenhNhan'>: Nghĩa là kiểu BenhNhan nhưng BỎ ĐI cái MaBenhNhan.
// Tại sao? Vì khi thêm mới, ta chưa có Mã, Server sẽ tự sinh ra Mã cho ta.
export const addPatient = async (benhNhanData: Omit<BenhNhan, 'MaBenhNhan'>): Promise<BenhNhan> => {
  const response = await fetch(`${API_BASE_URL}/add`, {
    method: 'POST', // POST: Hành động tạo mới.
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(benhNhanData), // Gửi thông tin người mới lên
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Thêm bệnh nhân thất bại');
  }

  // Backend trả về kết quả, thường sẽ chứa cái Mã Bệnh Nhân mới vừa sinh ra.
  const result = await response.json(); 
  
  // Ghép thông tin ta gửi đi + cái Mã server trả về => Thành một hồ sơ hoàn chỉnh
  return {
    ...benhNhanData,
    MaBenhNhan: result.MaBenhNhan
  } as BenhNhan;
};