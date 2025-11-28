import { Thuoc } from "../interfaces";

// Đường dẫn này khớp với server.js và proxy
const API_BASE_URL = "/api/v1/thuoc";

/**
 * [ĐÃ SỬA LẦN 2] Hàm chung để xử lý response từ fetch
 */
/**
 * Hàm này đóng vai trò là "Người kiểm hàng" (Quality Control).
 * Mọi dữ liệu từ Server (Bếp) gửi về đều phải qua đây kiểm tra trước khi dùng.
 */
const handleResponse = async (response: Response) => {
  // BƯỚC 1: Đọc dữ liệu trả về dưới dạng chữ (text) trước để an toàn
  const responseText = await response.text();//trả về một json  '{"ten": "Panadol", "gia": 5000}'; cần parse giúp bỏ ''

  // BƯỚC 2: Kiểm tra xem Server có báo lỗi không (Mã 4xx, 5xx)
  // response.ok = true nếu mã lỗi là ok thuộc khoảng này 200-299 (Thành công).
  // Nếu !response.ok nghĩa là có biến (Lỗi 400, 404, 500...).
  if (!response.ok) {
    // Cố gắng đọc thông báo lỗi từ JSON server gửi (ví dụ: { "message": "Trùng mã" })
    try {
      const errorJson = JSON.parse(responseText);
      // Nếu đọc được message thì ném ra, còn không thì báo lỗi chung
      throw new Error(errorJson.message || 'Có lỗi xảy ra từ phía server');
    } catch (e) {
      // Nếu dữ liệu lỗi không phải JSON (ví dụ HTML lỗi 404), ném nguyên văn bản ra
      throw new Error(responseText || `Lỗi kết nối: ${response.status}`);
    }
  }

  // BƯỚC 3: Nếu thành công, chuyển Text thành JSON (nếu có dữ liệu)
  // Nếu chuỗi rỗng thì trả về null (tránh lỗi crash app)
  return responseText ? JSON.parse(responseText) : null;
};
/**
 * ---------------------------------------------------------------------------
 * HÀM: addMedicine (Thêm thuốc mới)
 * TÁC DỤNG: Đóng gói thông tin thuốc từ Form -> Gửi cho Bếp (Server) -> Nhận kết quả.
 * ---------------------------------------------------------------------------
 */

// 1. KHAI BÁO HÀM
// "export": Để các file khác (như MedicineForm) có thể import và sử dụng hàm này.
// "const": Khai báo đây là một hằng số (tên hàm không đổi).
// "async": Báo hiệu hàm này xử lý BẤT ĐỒNG BỘ (cần thời gian chờ đợi, không xong ngay lập tức).
export const addMedicine = async (
  
  // 2. THAM SỐ ĐẦU VÀO (INPUT)
  // "thuocData": Tên biến chứa dữ liệu thuốc người dùng nhập (tên, giá, số lượng...).
  // ": Partial<Thuoc>": Kiểu dữ liệu. 
  // -> "Thuoc" là khuôn mẫu đầy đủ.
  // -> "Partial" (Một phần) nghĩa là dữ liệu này có thể thiếu vài trường (ví dụ thiếu ID do server chưa tạo).
  thuocData: Partial<Thuoc>

// 3. ĐẦU RA (OUTPUT)
// ": Promise<Thuoc>": Hàm này hứa (Promise) sẽ trả về một object Thuoc hoàn chỉnh (có cả ID) sau khi chạy xong.
): Promise<Thuoc> => {

  // 4. BẮT ĐẦU KHỐI "THỬ" (TRY)
  // "try": Ra lệnh cho máy tính: "Hãy cố gắng chạy những dòng code trong này".
  // Nếu có bất kỳ lỗi nào (mạng rớt, server sập), nó sẽ dừng ngay và nhảy xuống phần "catch".
  try {
    
    // 5. GỌI SERVER (FETCH) fetch( ĐỊA_CHỈ_NHẬN, { CẤU_HÌNH_GÓI_HÀNG } );
    // "const response =": Tạo biến để hứng kết quả trả về từ Server.
    // "await": Ra lệnh "ĐỨNG CHỜ Ở ĐÂY!". Code sẽ tạm dừng dòng này cho đến khi Server trả lời.
    // "fetch(...)": Hành động gọi điện/gửi yêu cầu lên Server.
    const response = await fetch(
      
      // 5.1. ĐỊA CHỈ (URL)
      // `${API_BASE_URL}/add`: Ghép địa chỉ gốc với đường dẫn thêm mới (/add).
      // Ví dụ: http://localhost:5000/api/v1/thuoc/add
      `${API_BASE_URL}/add`, 
      
      // 5.2. CẤU HÌNH GÓI HÀNG
      {
        // method: "POST" -> Hành động gửi dữ liệu mới lên (tương tự đi nộp đơn).
        // (Nếu lấy dữ liệu về thì dùng GET).
        method: "POST",
        
        // headers: "Tem nhãn" dán bên ngoài gói hàng.
        // Báo cho Server biết: "Dữ liệu bên trong là dạng JSON (chữ), hãy dịch đúng nhé".
        headers: {
          "Content-Type": "application/json",
        },
        
        // body: "Ruột" gói hàng.
        // JSON.stringify(thuocData): Biến đổi object (dữ liệu thuốc) thành chuỗi văn bản (String).
        // LÝ DO: Máy tính không thể gửi nguyên cục object qua dây mạng, phải biến thành chữ mới gửi được.
        body: JSON.stringify(thuocData),
      }
    );

    // 6. XỬ LÝ KẾT QUẢ
    // Sau khi chờ (await) xong, Server trả về cái hộp "response".
    // Ta đưa hộp này cho hàm "handleResponse" (Người kiểm hàng) để kiểm tra xem thành công hay thất bại.
    // Hàm này sẽ trả về viên thuốc mới nếu thành công, hoặc tự ném lỗi nếu thất bại.
    return await handleResponse(response);

  } catch (error) {
    // 7. KHỐI "BẮT LỖI" (CATCH)
    // Nếu dòng "fetch" hoặc "handleResponse" bên trên bị lỗi, code sẽ nhảy dù xuống đây ngay lập tức.
    
    // Ghi lỗi vào nhật ký (Console) để lập trình viên mở F12 lên xem được.
    console.error("Lỗi khi thêm thuốc:", error);
    
    // 8. NÉM TRẢ LỖI (THROW) - QUAN TRỌNG!
    // Vì hàm này (API) không có giao diện, nó không thể hiện thông báo đỏ cho người dùng.
    // Nó phải "NÉM" (throw) cục lỗi này ngược lại cho thằng gọi nó (MedicineForm).
    // Để MedicineForm bắt được và hiện thông báo "Thêm thất bại!" lên màn hình.
    throw error;
  }
};

/**
 * Cập nhật thuốc
 */
export const updateMedicine = async (
  maThuoc: string,
  data: Partial<Thuoc>
  // // [OUTPUT]: Hứa trả về viên thuốc đã được sửa xong.
): Promise<Thuoc> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fix/${maThuoc}`, {
      // Quy ước quốc tế: Dùng PUT (hoặc PATCH) khi muốn CẬP NHẬT dữ liệu
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật thuốc:", error);
    // [FIX] Ném lại lỗi để MedicineForm.tsx có thể bắt
    throw error;
  }
};

/**
 * Xóa thuốc (Kết nối với DELETE /delete/:maThuoc)
 */
export const deleteMedicine = async (maThuoc: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${maThuoc}`, {
      method: "DELETE",
      // GET và DELETE: Thường KHÔNG CÓ body. (Đi xin đồ hoặc đi hủy món thì xách người không đi thôi, không ai mang theo nguyên liệu cả).
      // POST và PUT: Bắt buộc PHẢI CÓ body. (Muốn thêm món thì phải đưa nguyên liệu cho bếp chứ).s
    });
    if (!response.ok) {
      await handleResponse(response); // Ném lỗi nếu có
    }
    // Nếu OK (ví dụ 200, 204), chỉ cần trả về
  } catch (error) {
    console.error("Lỗi khi xóa thuốc:", error);
    // [FIX] Ném lại lỗi
    throw error;
  }
};
