// src/components/AdminForms/PhieuNhapForm.tsx
import React, { useState, useEffect } from 'react';
import { Thuoc, NhaCungCap, ChiTietNhapCreate, PhieuNhapCreatePayload } from '../../interfaces';
import { getNhaCungCapList } from '../../api/nhaCungCapApi';
import { getMedicines } from '../../api/thuocApi';
import { addPhieuNhap } from '../../api/phieuNhapApi';

import styles from '../../styles/PhieuNhapForm.module.css';

interface PhieuNhapFormProps {
  onClose: () => void;
  onSave: () => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const PhieuNhapForm: React.FC<PhieuNhapFormProps> = ({ onClose, onSave }) => {
  
  // --- STATE QUẢN LÝ DỮ LIỆU TỪ API ---
  const [nhaCungCapList, setNhaCungCapList] = useState<NhaCungCap[]>([]);
  // [SỬA 1] Thêm 2 state để quản lý việc lọc thuốc
  const [allMedicines, setAllMedicines] = useState<Thuoc[]>([]); // Danh sách TẤT CẢ thuốc
  const [filteredMedicines, setFilteredMedicines] = useState<Thuoc[]>([]); // Danh sách ĐÃ LỌC
  
  const [maNhanVien, setMaNhanVien] = useState<string>('');
  
  // --- STATE QUẢN LÝ FORM ---
  const [selectedNCC, setSelectedNCC] = useState<string>(''); // Lưu MaNhaCungCap
  const [chiTietRows, setChiTietRows] = useState<Partial<ChiTietNhapCreate>[]>([]);
  
  // --- STATE QUẢN LÝ TRẠNG THÁI UI ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. TẢI DỮ LIỆU BAN ĐẦU ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // TODO: Thay thế bằng AuthContext hoặc cách lấy user đang đăng nhập
        const currentMaNV = localStorage.getItem('maNhanVien'); 
        if (!currentMaNV) {
          throw new Error('Không tìm thấy Mã Nhân Viên. Vui lòng đăng nhập lại.');
        }
        setMaNhanVien(currentMaNV);

        // Gọi API lấy NCC và Thuốc
        const [nccData, thuocData] = await Promise.all([
          getNhaCungCapList(),
          getMedicines() // API này giờ đã trả về MaNhaCungCap
        ]);
        
        setNhaCungCapList(nccData);
        setAllMedicines(thuocData); // [SỬA 2] Lưu vào danh sách tổng
        
        // Tự động chọn NCC đầu tiên (nếu có)
        if (nccData.length > 0) {
          setSelectedNCC(nccData[0].MaNhaCungCap);
        }

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Chỉ chạy 1 lần

  // --- 2. [MỚI] LOGIC LỌC THUỐC ---
  // Effect này sẽ chạy mỗi khi 'selectedNCC' (nhà cung cấp) hoặc 'allMedicines' (danh sách tổng) thay đổi
  useEffect(() => {
    if (selectedNCC) {
      // 1. Lọc danh sách thuốc
      const filtered = allMedicines.filter(
        (thuoc) => thuoc.MaNhaCungCap === selectedNCC
      );
      setFilteredMedicines(filtered);

      // 2. [QUAN TRỌNG] Reset lại các hàng chi tiết
      // Vì đã đổi NCC, các thuốc cũ (nếu có) không còn hợp lệ
      setChiTietRows([
        { // Thêm 1 hàng trống cho nhà cung cấp mới
          MaThuoc: '',
          SoLuongNhap: 1,
          DonGiaNhap: 0,
          HanSuDung: getTodayString()
        }
      ]);
      
    } else {
      // Nếu không có NCC nào được chọn, làm trống danh sách
      setFilteredMedicines([]);
      setChiTietRows([]);
    }
  }, [selectedNCC, allMedicines]); // Phụ thuộc vào 2 state này


  // --- 3. HÀM XỬ LÝ BẢNG CHI TIẾT ĐỘNG ---

  // Thêm một hàng mới (cho cùng NCC)
  const handleAddRow = () => {
    setChiTietRows([
      ...chiTietRows,
      {
        MaThuoc: '',
        SoLuongNhap: 1,
        DonGiaNhap: 0,
        HanSuDung: getTodayString()
      }
    ]);
  };

  // Xóa một hàng khỏi bảng
  const handleRemoveRow = (indexToRemove: number) => {
    setChiTietRows(chiTietRows.filter((_, index) => index !== indexToRemove));
  };

  // Cập nhật dữ liệu khi người dùng nhập vào 1 ô trong bảng
  const handleRowChange = (index: number, field: keyof ChiTietNhapCreate, value: string | number) => {
    const newRows = [...chiTietRows];
    
    if (field === 'SoLuongNhap' || field === 'DonGiaNhap') {
      newRows[index][field] = Number(value);
    } else {
      newRows[index][field] = String(value);
    }
    
    setChiTietRows(newRows);
  };

  // --- 4. HÀM SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Validate (Kiểm tra) ---
    if (!selectedNCC) {
      setError('Vui lòng chọn một nhà cung cấp.');
      return;
    }
    // ... (các validate khác giữ nguyên) ...
    const validChiTiet: ChiTietNhapCreate[] = [];
    for (const row of chiTietRows) {
      if (!row.MaThuoc) {
        setError('Vui lòng chọn thuốc cho tất cả các dòng.');
        return;
      }
      if (!row.SoLuongNhap || row.SoLuongNhap <= 0) {
        setError(`Số lượng nhập cho thuốc phải lớn hơn 0.`);
        return;
      }
       if (row.DonGiaNhap === undefined || row.DonGiaNhap < 0) {
        setError(`Đơn giá nhập không được âm.`);
        return;
      }
      if (!row.HanSuDung) {
        setError(`Vui lòng nhập Hạn sử dụng.`);
        return;
      }
      validChiTiet.push(row as ChiTietNhapCreate);
    }

    // --- Gửi Payload ---
    const payload: PhieuNhapCreatePayload = {
      MaNhaCungCap: selectedNCC,
      MaNhanVien: maNhanVien,
      chiTiet: validChiTiet
    };

    setIsSubmitting(true);
    try {
      await addPhieuNhap(payload);
      alert('Thêm phiếu nhập thành công!');
      onSave(); 
      onClose(); 
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER ---
  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (error && !isSubmitting) return <div className={styles.errorText}>Lỗi: {error}</div>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Hàng 1: Thông tin chung */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="MaNhaCungCap">Nhà Cung Cấp *</label>
          <select
            id="MaNhaCungCap"
            name="MaNhaCungCap"
            value={selectedNCC}
            onChange={(e) => setSelectedNCC(e.target.value)} // <-- Khi đổi NCC, effect lọc sẽ chạy
            required
          >
            {nhaCungCapList.length === 0 && <option disabled>Không có nhà cung cấp</option>}
            {nhaCungCapList.map(ncc => (
              <option key={ncc.MaNhaCungCap} value={ncc.MaNhaCungCap}>
                {ncc.TenNhaCungCap}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="MaNhanVien">Nhân Viên Nhập</label>
          <input
            type="text"
            id="MaNhanVien"
            name="MaNhanVien"
            value={maNhanVien}
            disabled
            className={styles.disabledInput}
          />
        </div>
      </div>

      {/* Hàng 2: Bảng chi tiết thuốc */}
      <h3 className={styles.tableTitle}>Chi Tiết Thuốc</h3>
      <table className={styles.chiTietTable}>
        <thead>
          <tr>
            <th>Thuốc *</th>
            <th>Số Lượng *</th>
            <th>Đơn Giá Nhập *</th>
            <th>Hạn Sử Dụng *</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {chiTietRows.map((row, index) => (
            <tr key={index}>
              {/* [SỬA 3] Ô chọn thuốc giờ sẽ dùng 'filteredMedicines' */}
              <td>
                <select
                  name="MaThuoc"
                  value={row.MaThuoc}
                  onChange={(e) => handleRowChange(index, 'MaThuoc', e.target.value)}
                  required
                >
                  <option value="" disabled>-- Chọn thuốc --</option>
                  {filteredMedicines.length === 0 && selectedNCC && (
                    <option disabled>Không có thuốc cho NCC này</option>
                  )}
                  {filteredMedicines.map(thuoc => (
                    <option key={thuoc.MaThuoc} value={thuoc.MaThuoc}>
                      {thuoc.TenThuoc} ({thuoc.DonViTinh})
                    </option>
                  ))}
                </select>
              </td>
              {/* Các ô khác giữ nguyên */}
              <td>
                <input
                  type="number"
                  name="SoLuongNhap"
                  value={row.SoLuongNhap}
                  onChange={(e) => handleRowChange(index, 'SoLuongNhap', e.target.value)}
                  min="1"
                  required
                />
              </td>
              <td>
                <input
                  type="number"
                  name="DonGiaNhap"
                  value={row.DonGiaNhap}
                  onChange={(e) => handleRowChange(index, 'DonGiaNhap', e.target.value)}
                  min="0"
                  required
                />
              </td>
              <td>
                <input
                  type="date"
                  name="HanSuDung"
                  value={row.HanSuDung}
                  onChange={(e) => handleRowChange(index, 'HanSuDung', e.target.value)}
                  required
                />
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  className={styles.removeRowButton}
                  disabled={chiTietRows.length <= 1} // Không cho xóa nếu chỉ còn 1 hàng
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Nút thêm hàng */}
      <button 
        type="button" 
        onClick={handleAddRow} 
        className={styles.addRowButton}
        disabled={!selectedNCC} // Vô hiệu hóa nếu chưa chọn NCC
      >
        + Thêm Thuốc
      </button>

      {/* Hàng 3: Nút Submit và Lỗi */}
      {error && (
        <div className={styles.errorText}>
          {error}
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu Phiếu Nhập'}
        </button>
        <button type="button" className={styles.cancelButton} onClick={onClose}>
          Hủy
        </button>
      </div>
    </form>
  );
};