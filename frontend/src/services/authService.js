const API_URL = 'http://localhost:3000';

export const login = async (email, mat_khau) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mat_khau }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    // Tạo lỗi có thêm thuộc tính errorField
    const error = new Error(errorData.message || 'Lỗi đăng nhập');
    error.errorField = errorData.errorField || (errorData.message.includes('tài khoản') ? 'email' : 'password');

    throw error;
  }

  return await response.json();
};

export const register = async (ten, email, vai_tro = 'nhanvien') => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten, email, vai_tro }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Lỗi đăng ký');
  }

  return await response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error('Lỗi khi lấy danh sách người dùng');
  }

  return await response.json();
};

