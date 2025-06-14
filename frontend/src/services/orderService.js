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

  