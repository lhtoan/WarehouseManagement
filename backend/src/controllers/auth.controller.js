// const db = require('../config/db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = 'your_jwt_secret_key';

// const login = async (req, res) => {
//   const { tai_khoan, mat_khau } = req.body;

//   if (!tai_khoan || !mat_khau) {
//     return res.status(400).json({ message: 'Thiếu tài khoản hoặc mật khẩu' });
//   }

//   try {
//     const [rows] = await db.query('SELECT * FROM nguoi_dung WHERE tai_khoan = ?', [tai_khoan]);
//     if (rows.length === 0) {
//       return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
//     }

//     const user = rows[0];

//     const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });
//     }

//     const token = jwt.sign(
//       { id: user.id, tai_khoan: user.tai_khoan, vai_tro: user.vai_tro },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({ message: 'Đăng nhập thành công', token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Lỗi server' });
//   }
// };

// module.exports = { login };


const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
  const { email, mat_khau } = req.body;

  if (!email || !mat_khau) {
    return res.status(400).json({
      message: 'Tài khoản và mật khẩu không được bỏ trống',
      errorField: !email ? 'email' : 'password'
    });
  }

  try {
    const [rows] = await db.query('SELECT * FROM nguoi_dung WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Email không tồn tại!',
        errorField: 'email'
      });
    }

    const user = rows[0];

    if (mat_khau !== user.mat_khau) {
      return res.status(401).json({
        message: 'Mật khẩu không đúng!',
        errorField: 'password'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, vai_tro: user.vai_tro },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Đăng nhập thành công', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { login };
