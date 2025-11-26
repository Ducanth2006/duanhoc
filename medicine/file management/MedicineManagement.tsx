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
  // Khi bạn muốn một dữ liệu nào đó trong ứng dụng của mình thay đổi theo thời gian (ví dụ: số lần click, nội dung nhập vào ô input, trạng thái bật/tắt) VÀ khi dữ liệu đó thay đổi,
  //   bạn muốn React tự động cập nhật lại giao diện (UI), thì bạn dùng useState
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
  // Part2 2. Giao tiếp với Server (API Integration)

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
          { <td colSpan={8} className={styles.emptyCell}> }
            {/* Dạ, bảng của em có 8 cột tiêu đề. colSpan={8} giúp gộp 8 ô nhỏ thành 1 ô lớn trải dài hết chiều ngang của bảng, 
            để dòng chữ thông báo hiển thị đẹp ở chính giữa bảng ạ. */}
          
            Không có dữ liệu thuốc.
          </td>
        </tr>
      );
    }
{/* "Hàm .map() có nhiệm vụ duyệt qua từng viên thuốc và trả về một Mảng các thẻ <tr>.
Trong đó:
Thẻ <tr>: Giúp trình duyệt biết phải tạo một hàng mới (xuống dòng).
Thuộc tính key: Giúp React định danh hàng đó (để biết khi nào cần thêm, sửa, xóa).
Các thẻ <td> bên trong: Là nơi hiển thị dữ liệu chi tiết của viên thuốc đó." */}

    {/* Hàm .map() trong renderContent trả về cái gì?
Trả lời: "Dạ nó trả về một mảng mới chứa các thẻ HTML <tr>. Mỗi thẻ <tr> tương ứng với một viên thuốc trong danh sách dữ liệu gốc ạ." */}

    return medicines.map((med) =>{ (
      {/* Khái niệm: key là một thuộc tính (prop) đặc biệt mà React yêu cầu phải có khi render một danh sách các phần tử. Nó giống như ID định danh cho mỗi phần tử React.
      Tác dụng: Mục đích chính của nó là giúp React nhận diện phần tử nào đã thay đổi, được thêm vào hay bị xóa đi. Nhờ đó, React tối ưu hóa quá trình cập nhật giao diện (Re-render),
       chỉ cập nhật đúng chỗ cần thiết thay vì vẽ lại toàn bộ bảng, giúp trang web chạy nhanh và mượt hơn ạ." */}
      {/* thằng tr key  Mục đích: Đây là ID nội bộ để React theo dõi.
     React cần biết chính xác dòng này là dòng nào để nếu bạn xóa dòng đó, React chỉ xóa đúng cái <tr> đó khỏi màn hình thôi, không phải vẽ lại cả bảng.
     Thuộc tính key này KHÔNG hiển thị lên màn hình trình duyệt. Người dùng không thấy nó. */}
    //  sẽ trả về tất cả dữ liệu dưới đây 

      <tr key={med.MaThuoc}>{/* Quy tắc của React là: Phải gắn thẻ căn cước (key) cho cái "bao bì" ngoài cùng của mỗi phần tử trong danh sách. để 
      <tr>: Để tạo ra dòng kẻ ngang (nếu không có nó, bảng sẽ nát bét).

      key: Để React phân biệt dòng này với dòng kia. */}

      
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
            /* Dạ nếu viết onClick={handleOpenModal(med)} (không có hàm bao), 
            thì hàm sẽ chạy ngay lập tức khi trang vừa load (gây lỗi lặp vô tận).
             Em cần bọc nó trong () => ... để bảo React là: 'Chỉ khi nào người dùng bấm chuột thì mới chạy hàm này' ạ."*/
            className={styles.editButton}
          >
            Sửa
          </button>
        </td>
      </tr>
    );
  };
{/* End Part2  */}


{/* PART 3 Hiển thị Dữ liệu (Data Rendering) và Điều phối Hành động (Event Handling & Orchestration)

 */ }
  return (
    <>
    {/* Dạ đó là React Fragment. Nó giúp gom nhóm nhiều phần tử con lại để trả về mà không cần sinh thêm một thẻ <div> thừa thãi trong cây DOM của trình duyệt, giúp HTML gọn gàng hơn ạ. */}
      <div className={styles.container}>
        <h1 className={styles.title}>Quản lý Danh sách thuốc</h1>
        <button
          onClick={() => handleOpenModal(null)}// nếu viết onClick={handleOpenModal(med)} thiếu () thì hàm sẽ tự chạy khi load lại ,
          // bọc nó () để Chỉ khi nào người dùng bấm chuột thì mới chạy hàm này' ạ  
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
          {/* Dạ, dấu ngoặc nhọn {} cho phép nhúng biểu thức JavaScript vào JSX. Ở đây em gọi hàm renderContent() để lấy kết quả trả về (là return [
          <tr key="1">Thuốc A</tr>,
          <tr key="2">Thuốc B</tr>,
          <tr key="3">Thuốc C</tr>];
          sau đó Quy tắc của React là: Nếu bạn đặt một Mảng các thẻ HTML vào trong {JSX}, React sẽ tự động "gỡ bỏ" cái vỏ mảng và xếp từng phần tử ruột ra bàn.
          <tbody> [
          <tr key="1">Thuốc A</tr>,
          <tr key="2">Thuốc B</tr>,
          <tr key="3">Thuốc C</tr>];</tbody>
          và cuối cùng là sẽ bỏ dấu []
          <tbody>
                <tr>...Thuốc A...</tr>
                <tr>...Thuốc B...</tr>
                <tr>...Thuốc C...</tr>
          </tbody>
          chú ý ở trong bài sẽ trả về tr và td bọc ở trong nhé 
     
) 
          và hiển thị chúng vào phần thân của bảng ạ." */}
        </table>
      </div>
      {/* Mở Form (handleOpenModal): Phân biệt thông minh giữa hành động Thêm và Sửa. */}
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedMedicine ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
        // Dạ đây là Toán tử 3 ngôi (Ternary Operator). Em dùng nó để tạo tiêu đề động cho Modal.Nếu selectedMedicine có dữ liệu (Truthy)
        //   Tiêu đề là 'Sửa'.Ngược lại (Falsy/Null) Tiêu đề là 'Thêm'.Giúp em tái sử dụng 1 Modal cho cả 2 chức năng."
      >
        {/* Props onSave={handleSave} truyền xuống MedicineForm hoạt động theo cơ chế nào? Dạ đây là cơ chế Callback. Em truyền hàm handleSave của cha xuống cho con.
         Khi con lưu xong, con sẽ 'gọi điện' (invoke) hàm này. 
        Nhờ đó, cha biết để thực hiện hành động tiếp theo là đóng form và tải lại danh sách ạ." */}
        <MedicineForm
          medicine={selectedMedicine}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      </Modal>
    </>
  );
  {/* kết thúc jsx */}
};

export default MedicineManagement;
