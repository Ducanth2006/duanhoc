// src/api/phieuNhapApi.ts

import { ChiTietNhapLichSu, PhieuNhapCreatePayload } from '../interfaces';
const API_BASE_URL = '/api/v1/phieunhap';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra từ server');
    } catch (jsonError) {
      const errorText = await response.text();
      throw new Error(`Lỗi ${response.status}: ${response.statusText}. Phản hồi không phải JSON.`);
    }
  }
  return response.json();
};


export const getChiTietNhapList = async (): Promise<ChiTietNhapLichSu[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/details`);
    const data = await handleResponse(response);
    return data as ChiTietNhapLichSu[]; 
  } catch (error) {
    console.error('Lỗi khi tải lịch sử chi tiết nhập:', error);
    throw error;
  }
};
export const addPhieuNhap = async (payload: PhieuNhapCreatePayload): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Gửi payload (đã có MaNCC, MaNV, chiTiet)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Lỗi khi thêm phiếu nhập:', error);
    throw error;
  }};
export {};