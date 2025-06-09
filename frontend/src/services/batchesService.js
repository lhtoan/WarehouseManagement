const API_URL = 'http://localhost:3000'; // URL backend của bạn


export async function fetchBatches() {
  const response = await fetch(`${API_URL}/batches`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy danh sách lô hàng');
  }
  const data = await response.json();
  return data;
}


// Thêm một lô hàng mới
export async function addBatch(batch) {
  // batch là object có dạng { ma_lo: string, ngay_nhap: string }
  const response = await fetch(`${API_URL}/batches/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi khi thêm lô hàng');
  }

  return response.json();
}
