// src/components/AdminForms/MedicineForm.tsx
import React, { useState, useEffect } from "react";
import { Thuoc, LoaiThuoc, NhaCungCap } from "../../interfaces";
import styles from "../../styles/Form.module.css";

// [SỬA LỖI IMPORT]
// 1. Import hàm thêm/sửa thuốc từ 'thuocApi'
import { addMedicine, updateMedicine } from "../../api/thuocApi";
// 2. Import hàm lấy tên loại thuốc từ 'loaiThuocApi' (File mới của bạn)
import { getLoaiThuocListname } from "../../api/loaiThuocApi";
// 3. Import hàm lấy tên NCC từ 'nhaCungCapApi'
import { getNhaCungCapListForDropdown } from "../../api/nhaCungCapApi";
// nhận prop và truyền prop
interface MedicineFormProps {
  medicine: Thuoc | null;
  onSave: () => void; //Tóm lại: Trong các sự kiện (Events) như onClick, onSave, onClose... đa số chúng ta dùng void vì chúng ta chỉ cần Kích hoạt hành động chứ không cần Lấy giá trị trả về.
  onClose: () => void;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  medicine,
  onSave,
  onClose,
  // Kỹ thuật này gọi là Object Destructuring (Phân rã đối tượng) sử dụng {}.gọi luôn medicine hay onsave không phải props.medicine hay j hết á
}) => {
  // ta phải khai báo đầy đủ  (TenThuoc: '', Gia: 0...) để các ô input luôn có giá trị "làm vốn" ngay từ khi mở lên để thêm mới , tránh lỗi undefined.
  // kiểu để tranh lỗi giữa input tự do và input bị kiểm
  /* tránh lỗi sau :
  nếu khai báo như file management 
  React sẽ hiểu đây là Uncontrolled Component (Input tự do). -> Sau đó người dùng gõ chữ "A" vào, biến ten cập nhật thành "A".
  React lại hiểu nó thành Controlled Component (Input bị kiểm soát). -> Việc chuyển đổi này gây ra cảnh báo đỏ lòm trong Console (lỗi phổ biến của người mới).
  Giải pháp: Chúng ta dùng Partial<Thuoc> để TypeScript cho phép biến này có thể thiếu trường (về mặt kiểu dữ liệu).
   NHƯNG, khi khởi tạo (useState(...)), chúng ta cố tình điền '' (chuỗi rỗng) hoặc 0 cho mọi ô. 
  -> Mục đích: Để ngay từ giây đầu tiên, cái Form đã có dữ liệu "sạch sẽ", React biết đây là Controlled Component, và người dùng thấy ô trống để nhập chứ không phải thấy chữ undefined. */
  const [formData, setFormData] = useState<Partial<Thuoc>>({
    //Partial<Thuoc>: thằng này để xử lý phần dữ liệu thêm mới  Vẫn là cấu trúc của Thuoc, nhưng tất cả các trường đều trở thành KHÔNG BẮT BUỘC (có cũng được, không có cũng được).
    MaThuoc: medicine?.MaThuoc || "", // dấu ?.  là Optional Chaining và Bạn dùng ?. bất cứ khi nào bạn nghi ngờ một cái gì đó có thể là null hoặc undefined
    TenThuoc: medicine?.TenThuoc || "", //Nó giúp kiểm tra xem biến medicine có tồn tại (khác null/undefined) hay không trước khi truy cập MaThuoc. Giúp code không bị crash nếu medicine là null (trường hợp Thêm mới).

    DonViTinh: medicine?.DonViTinh || "Viên",
    MaLoai: medicine?.MaLoai || "",
    MaNhaCungCap: medicine?.MaNhaCungCap || "",
    SoLuongTon: medicine?.SoLuongTon || 0,
    GiaNhap: medicine?.GiaNhap || 0,
    GiaBan: medicine?.GiaBan || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // State để lưu danh sách cho dropdown
  const [loaiThuocList, setLoaiThuocList] = useState<
    //Pick<Cái_khuôn_gốc, "Tên_trường_muốn_giữ_1" | "Tên_trường_muốn_giữ_2"> sẽ bỏ đi các trường không cần thiết
    Pick<LoaiThuoc, "MaLoai" | "TenLoai">[]
  >([]);
  const [nhaCungCapList, setNhaCungCapList] = useState<
    Pick<NhaCungCap, "MaNhaCungCap" | "TenNhaCungCap">[] // | kiểu giống dấu phảy
  >([]);

  // Dùng useEffect để tải dữ liệu cho dropdown
  useEffect(() => {
    // Tóm lại: Bạn không sai về cú pháp ()  =>.(cú pháp đóng gói) Nó luôn dùng để "hoãn lại" việc thực thi.
    // onClick: Hoãn lại chờ click.
    // useEffect: Hoãn lại chờ render xong.
    // hàm fetch data này chỉ dùng 1 only
    const fetchData = async () => {
      try {
        setFormError(null);

        // Gọi API song song
        const [loaiData, nccData] = await Promise.all([
          //ông thức: await Promise.all([Việc_A, Việc_B]). A  lỗi là toang luôn
          getLoaiThuocListname(), // Gọi hàm từ loaiThuocApi.ts
          getNhaCungCapListForDropdown(), // Gọi hàm từ nhaCungCapApi.ts
        ]);

        setLoaiThuocList(loaiData);
        setNhaCungCapList(nccData);
      } catch (err: any) {
        console.error("Lỗi khi tải dữ liệu form:", err);
        setFormError(
          err.message || "Không thể tải dữ liệu cho các ô lựa chọn."
        );
      }
    };
    fetchData();
  }, []); // [] đảm bảo chỉ chạy 1 lần

  const handleChange = () =>
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>// Khái niệm: Khi bạn gõ một phím hoặc chọn một dòng trong dropdown, trình duyệt sẽ tạo ra một Sự kiện (Event).
    // Biến e: Là gói tin chứa toàn bộ thông tin về hành động đó.
    // e.target: Chính là cái thẻ HTML mà bạn vừa tương tác (ví dụ: thẻ <input name="TenThuoc">).
    {
      const { name, value } = e.target; // Lấy tên ô và giá trị người dùng gõ
      //       name: Tên định danh của ô input (ví dụ: "TenThuoc", "GiaBan", "DonViTinh"...). Bạn đã đặt cái này trong prop name="..." ở phần JSX.
      //       value: Giá trị thực tế người dùng vừa nhập vào (ví dụ: "Panadol", "5000").

      // [FIX] Xử lý giá trị number
      //[name] cái dấu [] ở đây là Computed Property Name
      if (name === "GiaBan") {
        setFormData((prev) => ({
          // khi làm form điền ta cần ...prev(prev có thể đổi tên ) để tránh return ra một giá trị(kiểu thay đổi 1 ) thì sẽ làm mất tất cả giá trị còn lại
          ...prev, // thằng này là các dữ liệu trước đó giữ nguyên , khi đến GiaBan thì mới chuyển string ==> number
          [name]: value === "" ? 0 : parseFloat(value), //[name ] sẽ tự hiểu là GiaBan :value  Chuyển sang số toán tử 3 ngôi
        }));
      } else {
        setFormData((prev) => ({
          // ({}) đây là một object yêu cầu trả về object mà không cần return
          ...prev,
          [name]: value, //Cập nhật ô đang gõ (dùng [name] để biết là ô nào) [name] ở đây sẽ tự hiệu là các trường còn lại như ma thuoc, ten thuoc... vì vậy nó sẽ sửa trường đó 
        }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();//Vấn đề: Thẻ <form> trong HTML có một "tật xấu" cổ điển: Hễ bấm nút submit là nó sẽ tải lại (refresh) toàn bộ trang web. ==> cần ngăn dùng prevent
    setFormError(null);//reset lại lỗi để bắt lỗi mới nếu 

    // Kiểm tra validation cho <select>
    /* !formData.MaLoai có thể trả về null ==>  !null là true */ 
    if (!formData.MaLoai) {
      setFormError("Vui lòng chọn một loại thuốc.");
      return;
    }
    if (!formData.MaNhaCungCap) {
      setFormError("Vui lòng chọn một nhà cung cấp.");
      return;
    }

    // [FIX] Kiểm tra giá bán
    if (formData.GiaBan === undefined || formData.GiaBan < 0) {
      setFormError("Giá bán không hợp lệ.");
      return;
    }

    setIsSubmitting(true);//Làm mờ nút "Lưu" (disabled) để người dùng không bấm liên tục 10 lần (spam nút),Thông báo cho người dùng biết là hệ thống đang làm việc, hãy chờ đợ

    try {
      // [FIX] Thêm "GiaBan" vào dataToSave.
      // Backend của bạn đã hỗ trợ nhận GiaBan ở cả route "add" và "fix".
      // Tạo ra một gói dataToSave tin gọn gàng, chứa đúng những thông tin cần thiết để gửi đi.
      const dataToSave: Partial<Thuoc> = {
        TenThuoc: formData.TenThuoc,
        DonViTinh: formData.DonViTinh,
        MaLoai: formData.MaLoai,
        MaNhaCungCap: formData.MaNhaCungCap,
        GiaBan: formData.GiaBan || 0, // Đảm bảo gửi giá trị
      };
// Đây là phần thông minh nhất của hàm này. Nó tự biết khi nào là Thêm, khi nào là Sửa.
      if (medicine && medicine.MaThuoc) {
        // TRƯỜNG HỢP 1: SỬA (Edit)
        // Logic: Có biến medicine VÀ có Mã thuốc -> Tức là đang sửa thuốc cũ ==>gọi hàm update
        await updateMedicine(medicine.MaThuoc, dataToSave); // Từ thuocApi.ts
      } else {
        // trường hợp 2 thêm mới ==> gọi hàm add 
        await addMedicine(dataToSave); // Từ thuocApi.ts
      }
      onSave();// gọi hàm đóng modal tải lại trang
      onClose();// đóng modal, trong selectMedicine(hay medicine trong file này) =null reset lại 
    } catch (error: any) {
      setFormError(error.message || "Lỗi khi lưu thuốc.");
    } finally {
      setIsSubmitting(false);//finally là nơi luôn luôn chạy cuối cùng, giúp đảm bảo ứng dụng không bị treo ở trạng thái "Đang lưu..." mãi mãi.
    }
  };

  const isEditMode = !!medicine;//để ép một biến bất kỳ về kiểu Đúng/Sai (Boolean).À, đoạn này chỉ hiện ra khi đang ở Chế độ Sửa".

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {/* Hễ ai bấm nút Submit (Lưu) trong cái khung này, thì hãy gọi ngay anh bảo vệ handleSubmit ra xử lý nhé (đừng có tự tải lại trang)" */}
      <div className={styles.formGrid}>
        {isEditMode && (
          <div className={styles.formGroup}>
            <label htmlFor="MaThuoc">Mã Thuốc</label>
            <input
              type="text"
              id="MaThuoc"
              name="MaThuoc"// 1. Định danh: "Tôi là ma thuoc"
              value={formData.MaThuoc}// 2. Hiển thị: Lấy dữ liệu từ State ra hiện lên
              disabled {/* Hiện ra nhưng khóa lại (disabled) */}
              className={styles.disabledInput}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="TenThuoc">Tên Thuốc</label>
          <input
            type="text"
            id="TenThuoc"
            name="TenThuoc"// 1. Định danh: "Tôi là Tên Thuốc"
            value={formData.TenThuoc}// 2. Hiển thị: Lấy dữ liệu từ State ra hiện lên , Cơ chế "Hai chiều" (Two-way binding):State (formData) -> hiện ra input.
            onChange={handleChange}// 3. Lắng nghe: Có ai gõ gì thì báo handleChange ,  Gõ vào input -> cập nhật ngược lại State (qua handleChange).
            required// 4. Bắt buộc: Không được để trống
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="DonViTinh">Đơn Vị Tính</label>
          <select
            id="DonViTinh"
            name="DonViTinh"
            value={formData.DonViTinh}
            onChange={handleChange}
            required
          >
            <option value="Viên">Viên</option>
            <option value="Vỉ">Vỉ</option>
            <option value="Hộp">Hộp</option>
            <option value="Chai">Chai</option>
            <option value="Tuýp">Tuýp</option>
            <option value="Gói">Gói</option>
          </select>
        </div>

        {/* Đổi <input> thành <select> */}
        <div className={styles.formGroup}>
          <label htmlFor="MaLoai">Loại Thuốc</label>
          <select
            id="MaLoai"
            name="MaLoai"
            value={formData.MaLoai}//Select value: Xác định giá trị HIỆN TẠI (Đang chọn cái nào).
            onChange={handleChange}
            required
          >
            {/* Dùng hàm .map để "in" ra hàng loạt option từ danh sách */}
            <option value="">-- Chọn loại thuốc --</option>
            {loaiThuocList.map((loai) => (
              
               <option key={loai.MaLoai} value={loai.MaLoai}>// Option value: Định nghĩa giá trị TIỀM NĂNG (Nếu chọn tôi thì được cái này).
                {loai.TenLoai}{/* Hiện Tên cho người dùng đọc, nhưng Value là Mã */}
              </option>
            ))}
          </select>
        </div>

        {/* Đổi <input> thành <select> */}
        <div className={styles.formGroup}>
          <label htmlFor="MaNhaCungCap">Nhà Cung Cấp</label>
          <select
            id="MaNhaCungCap"
            name="MaNhaCungCap"
            value={formData.MaNhaCungCap}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn nhà cung cấp --</option>
            {nhaCungCapList.map((ncc) => (
              <option key={ncc.MaNhaCungCap} value={ncc.MaNhaCungCap}>
                {ncc.TenNhaCungCap}
              </option>
            ))}
          </select>
        </div>

        {/* [FIX] Di chuyển Giá Bán ra ngoài và cho phép chỉnh sửa */}
        <div className={styles.formGroup}>
          <label htmlFor="GiaBan">Giá bán (VNĐ)</label>
          <input
            type="number"
            id="GiaBan"
            name="GiaBan"
            value={formData.GiaBan}
            onChange={handleChange} // Cho phép thay đổi
            min="0" // Đảm bảo giá không âm
            required
            // Đã loại bỏ 'disabled' và 'className'
          />
        </div>

        {/* Nên SoLuongTon và GiaNhap chỉ hiện ra để xem (tham khảo) chứ không cho sửa ở đây. Muốn sửa số lượng phải đi làm Phiếu Nhập/Xuất. */}

        {/* Các trường còn lại (chỉ hiển thị ở Edit Mode và vẫn disabled) */}
        {isEditMode && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="SoLuongTon">Số Lượng Tồn</label>
              <input
                type="number"
                id="SoLuongTon"
                name="SoLuongTon"
                value={formData.SoLuongTon}
                disabled
                className={styles.disabledInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="GiaNhap">Giá nhập (VNĐ)</label>
              <input
                type="number"
                id="GiaNhap"
                name="GiaNhap"
                value={formData.GiaNhap}
                disabled
                className={styles.disabledInput}
              />
            </div>

            {/* [FIX] Đã di chuyển ô Giá Bán ra ngoài khối này */}
          </>
        )}
      </div>{" "}
      {/* Đóng .formGrid */}
      {formError && <div className={styles.errorText}>{formError}</div>}
      <div className={styles.buttonGroup}>
        <button
          type="submit"//type="submit": Đây chính là "cái còi báo động". ==> thằng <form onSubmit={handleSubmit} thấy type submit kích hoạt onSubmit 
          // để type ở đây có tác dụng Khi dùng <form>, nếu người dùng đang gõ ở ô TenThuoc mà lỡ tay bấm phím Enter, trình duyệt sẽ hiểu đó là hành động Submit và tự động lưu luôn (rất tiện lợi).
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          Hủy
        </button>
      </div>
    </form>
  );
};
