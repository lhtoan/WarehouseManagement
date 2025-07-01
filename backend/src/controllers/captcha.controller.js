import fetch from 'node-fetch';

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export const verifyCaptcha = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Thiếu token CAPTCHA' });
  }

  try {
    const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${SECRET_KEY}&response=${token}`,
    });

    const data = await googleResponse.json();

    if (data.success) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: 'CAPTCHA không hợp lệ' });
    }
  } catch (err) {
    console.error('Lỗi xác minh CAPTCHA:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
