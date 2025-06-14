const API_URL = 'http://localhost:3000';

export async function getAllShippingUnits() {
  const response = await fetch(`${API_URL}/attributes/shippingunit`);
  if (!response.ok) {
    throw new Error('Lỗi khi lấy danh sách đơn vị vận chuyển');
  }
  const data = await response.json();
  return data;
}

export async function createOrder(orderData) {
  const response = await fetch(`${API_URL}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi tạo đơn hàng');
    } else {
      const errorText = await response.text();
      throw new Error('Lỗi không mong đợi từ server: ' + errorText);
    }
  }

  // Nếu phản hồi đúng là JSON
  const result = await response.json();
  return result;
}

export async function getAllOrdersWithDetails() {
  const response = await fetch(`${API_URL}/orders/detail`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Lỗi khi lấy danh sách đơn hàng: ' + errorText);
  }
  return await response.json();
}

export async function updateOrderStatus(ma_don_hang, trang_thai, nguoi_cap_nhat = 1) {
  const response = await fetch(`${API_URL}/orders/${ma_don_hang}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trang_thai, nguoi_cap_nhat }),
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi khi cập nhật trạng thái');
    } else {
      const errorText = await response.text();
      throw new Error('Lỗi không mong đợi từ server: ' + errorText);
    }
  }

  return await response.json();
}

export async function getOrderStatusHistory(ma_hoa_don) {
  const response = await fetch(`${API_URL}/status/${ma_hoa_don}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Lỗi khi lấy lịch sử trạng thái: ' + errorText);
  }
  return await response.json(); 
}
