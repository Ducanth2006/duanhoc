import { NhaCungCap } from "../interfaces";

// Địa chỉ gốc của Server Backend.
// Mọi yêu cầu sẽ được nối vào sau địa chỉ này.
const API_BASE_URL = "http://localhost:8080/api/v1/nhacungcap";

/**
 * Hàm phụ trợ (Helper Function) để xử lý kết quả trả về từ Server.
 * Tại sao cần? Để tránh việc viết đi viết lại đoạn code kiểm tra lỗi response.ok
 */
const handleResponse = async (response: Response) => {
  // Nếu Server trả về lỗi (ví dụ 404, 500)
  if (!response.ok) {
    const errorText = await response.text(); //Đọc kết quả dạng chữ thường (khi server báo lỗi dạng text thô)
    try {
      // Cố gắng đọc lỗi dạng JSON
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || "Có lỗi xảy ra từ server");
    } catch (jsonError) {
      // Nếu không phải JSON thì báo lỗi chung chung
      throw new Error(errorText || "Lỗi không xác định");
    }
  }

  // Nếu thành công, kiểm tra xem server trả về JSON hay Text
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json(); // Trả về dữ liệu dạng Object
  }
  // Mặc định trả về thông báo thành công
  return { success: true, message: "Hành động thành công" };
};

/**
 * 1. Lấy danh sách (GET)
 * Giống như đi siêu thị xem hàng.
 */
export const getNhaCungCap = async (): Promise<NhaCungCap[]> => {
  try {
    // fetch mặc định là GET Mặc định hàm fetch() sử dụng phương thức GET ạ.
    const response = await fetch(`${API_BASE_URL}/list`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Lỗi khi tải danh sách nhà cung cấp:", error);
    throw error; // Ném lỗi ra ngoài để file giao diện (NhaCungCapManagement) bắt được
  }
};

/**
 * 2. Thêm mới (POST)
 * Giống như gửi thư đi. Cần đóng gói dữ liệu (body).
 */
export const addNhaCungCap = async (
  data: Partial<NhaCungCap>
): Promise<NhaCungCap> => {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST", // Hành động: Tạo mới
      headers: { "Content-Type": "application/json" }, // Dán tem: "Đây là hàng JSON"
      body: JSON.stringify(data), // Đóng gói dữ liệu thành chuỗi để gửi qua mạng
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Lỗi khi thêm nhà cung cấp:", error);
    throw error;
  }
};

/**
 * 3. Cập nhật (PUT)
 * Giống như sửa lại nội dung hồ sơ.
 */
export const updateNhaCungCap = async (
  maNhaCungCap: string,
  data: Partial<NhaCungCap>
): Promise<NhaCungCap> => {
  try {
    const response = await fetch(`${API_BASE_URL}/fix`, {
      // Endpoint là /fix (theo backend của bạn)
      method: "PUT", // Hành động: Cập nhật
      headers: { "Content-Type": "application/json" },
      // Gửi kèm cả mã cũ và dữ liệu mới
      body: JSON.stringify({ ...data, MaNhaCungCap: maNhaCungCap }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Lỗi khi cập nhật nhà cung cấp:", error);
    throw error;
  }
};

/**
 * 4. Xóa (DELETE)
 * Giống như xé bỏ hồ sơ.
 */
export const deleteNhaCungCap = async (maNhaCungCap: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${maNhaCungCap}`, {
      method: "DELETE", // Hành động: Xóa
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Lỗi khi xóa nhà cung cấp:", error);
    throw error;
  }
};

// Hàm cũ giữ lại để tương thích ngược (nếu code cũ có dùng)
export const getNhaCungCapList = async (): Promise<NhaCungCap[]> => {
  return getNhaCungCap();
};

// Hàm lấy danh sách rút gọn cho Dropdown (chỉ lấy Tên và Mã)
export const getNhaCungCapListForDropdown = async (): Promise<
  Pick<NhaCungCap, "MaNhaCungCap" | "TenNhaCungCap">[]
> => {
  try {
    const response = await fetch(`${API_BASE_URL}/`); // Gọi endpoint gốc (tùy backend quy định)
    const data = await handleResponse(response);
    return data as NhaCungCap[];
  } catch (error) {
    console.error("Lỗi khi tải danh sách tên nhà cung cấp:", error);
    throw error;
  }
};
