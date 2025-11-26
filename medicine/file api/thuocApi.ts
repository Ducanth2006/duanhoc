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
  // BƯỚC 1: Đọc nội dung thô
  // await: Chờ server gửi hết dữ liệu về đã.
  // .text(): Đọc toàn bộ nội dung trong gói hàng ra thành chữ (String)
  // chứ chưa vội ép thành JSON. Lý do: Nếu server lỗi, nó có thể trả về
  // trang web HTML báo lỗi, ép thành JSON ngay sẽ bị crash app.
  const responseBodyAsText = await response.text(); //trả về một json  '{"ten": "Panadol", "gia": 5000}'; cần parse giúp bỏ ''

  // BƯỚC 2: Kiểm tra "Tem dán" (Status Code)
  // response.ok = true nếu mã lỗi là ok thuộc khoảng này 200-299 (Thành công).
  // Nếu !response.ok nghĩa là có biến (Lỗi 400, 404, 500...).
  if (!response.ok) {
    // Trường hợp 1: Server báo lỗi "tử tế" (dạng JSON chuẩn)
    // Ví dụ: { "message": "Tên thuốc đã tồn tại" }
    try {
      const errorData = JSON.parse(responseBodyAsText);
      // Ném cái lỗi này ra ngoài để file MedicineForm nhận được và hiện thông báo đỏ
      throw new Error(errorData.message || "Lỗi từ server");
    } catch (jsonParseError) {
      // Trường hợp 2: Server báo lỗi "lộn xộn" (dạng Text hoặc HTML lẫn lộn)
      // Đoạn này là "Cứu vãn tình thế", cố gắng bới tìm thông báo lỗi trong đống lộn xộn

      // Nếu trong đống chữ đó có chứa từ khóa "message":...
      if (responseBodyAsText.includes('{"message":')) {
        try {
          // Dùng "Kính lúp" (Regex) để cắt đúng cái câu thông báo lỗi ra
          const match = responseBodyAsText.match(/{"message":"(.*?)"}/);
          if (match && match[1]) {
            throw new Error(match[1]); // Tìm thấy rồi! Ném lỗi sạch sẽ ra.
          }
        } catch (e) {
          // Không làm gì cả, xuống dưới ném lỗi gốc
        }
      }

      // Trường hợp 3: Bó tay toàn tập
      // Ném nguyên xi đống chữ lộn xộn đó ra làm lỗi, hoặc báo lỗi chung chung kèm mã số
      throw new Error(
        responseBodyAsText || `Lỗi HTTP! Mã trạng thái: ${response.status}`
      );
    }
  }

  // BƯỚC 3: Nếu hàng ngon (response.ok là true)
  try {
    // Kiểm tra xem có dữ liệu không?
    // Nếu có: Biến chữ (String) thành Vật thể (Object/JSON) để code sử dụng.
    // Nếu không (rỗng): Trả về null.
    return responseBodyAsText ? JSON.parse(responseBodyAsText) : null;
  } catch {
    return null; // Phòng hờ trường hợp dữ liệu bị hỏng, trả về rỗng cho an toàn.
  }
};
/**
 * Thêm thuốc
 */
export const addMedicine = async (
  thuocData: Partial<Thuoc>
): Promise<Thuoc> => {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(thuocData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Lỗi khi thêm thuốc:", error);
    // [FIX] Ném lại lỗi để MedicineForm.tsx có thể bắt
    throw error;
  }
};

/**
 * Cập nhật thuốc
 */
export const updateMedicine = async (
  maThuoc: string,
  data: Partial<Thuoc>
): Promise<Thuoc> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fix/${maThuoc}`, {
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
