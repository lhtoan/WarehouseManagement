const API_URL = 'http://localhost:3000';

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu sản phẩm');
  }
  const data = await response.json();
  return data;
}

export async function fetchColors() {
  const response = await fetch(`${API_URL}/attributes/color`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu màu sắc');
  }
  const data = await response.json();
  return data;
}

export async function fetchSizes() {
  const response = await fetch(`${API_URL}/attributes/size`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy dữ liệu size');
  }
  const data = await response.json();
  return data;
}

// Tạo sản phẩm
// Tạo sản phẩm
export async function createProduct(productData) {
  const response = await fetch(`${API_URL}/products/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData), // { ma_san_pham, ten_san_pham }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Lỗi khi tạo sản phẩm');
  }

  const data = await response.json(); // { message, san_pham_id }
  return data;
}


export async function addVariant(sanPhamId, variantFormData) {
  const response = await fetch(`${API_URL}/products/${sanPhamId}/variants`, {
    method: 'POST',
    body: variantFormData, // gồm mau_sac, size, gia_ban, so_luong, lo_hang_id, hinh_anh
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Lỗi khi thêm biến thể');
  }

  const data = await response.json(); // { message, bien_the_id }
  return data;
}
