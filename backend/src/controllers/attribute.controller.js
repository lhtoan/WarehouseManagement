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

const createSize = async (req, res) => {
  const { ten_size } = req.body;

  if (!ten_size || ten_size.trim() === '') {
    return res.status(400).json({ message: 'Tên size không được bỏ trống' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO size (ten_size) VALUES (?)`,
      [ten_size.trim()]
    );
    res.status(201).json({ message: 'Thêm size thành công', id: result.insertId });
  } catch (err) {
    console.error('Lỗi khi thêm size:', err);
    res.status(500).json({ message: 'Lỗi khi thêm size', error: err });
  }
};

// Thêm mới màu
const createColor = async (req, res) => {
  const { ten_mau } = req.body;

  if (!ten_mau || ten_mau.trim() === '') {
    return res.status(400).json({ message: 'Tên màu không được bỏ trống' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO mau (ten_mau) VALUES (?)`,
      [ten_mau.trim()]
    );
    res.status(201).json({ message: 'Thêm màu thành công', id: result.insertId });
  } catch (err) {
    console.error('Lỗi khi thêm màu:', err);
    res.status(500).json({ message: 'Lỗi khi thêm màu', error: err });
  }
};

const getAllShippingUnits = async (req, res) => {
  const sql = 'SELECT * FROM don_vi_van_chuyen';
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Lỗi truy vấn:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};


module.exports = {
  getSizeValues,
  getColorValues,
  createSize,
  createColor,
  getAllShippingUnits
};