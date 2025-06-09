const multer = require('multer');
const path = require('path');

// Cấu hình lưu file ảnh vào thư mục public/product
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Lọc file chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

module.exports = upload;
