const db = require('../config/db');

// Lấy danh sách các size
const getSizeValues = async (req, res) => {
  const sql = `
    SELECT id AS gia_tri_id, ten_size AS gia_tri
    FROM size
    ORDER BY id;
  `;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Lỗi MySQL (Size):", err);
    res.status(500).json({ message: 'Lỗi truy vấn size', error: err });
  }
};

// Lấy danh sách các màu
const getColorValues = async (req, res) => {
  const sql = `
    SELECT id AS gia_tri_id, ten_mau AS gia_tri
    FROM mau
    ORDER BY id;
  `;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error("Lỗi MySQL (Màu):", err);
    res.status(500).json({ message: 'Lỗi truy vấn màu', error: err });
  }
};

module.exports = {
  getSizeValues,
  getColorValues
};
