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

