const API_URL = 'http://localhost:3000'; // hoặc thay bằng env nếu cần

export async function verifyCaptcha(token) {
  const response = await fetch(`${API_URL}/verify-captcha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Xác minh CAPTCHA thất bại');
  }

  const data = await response.json();
  return data;
}
