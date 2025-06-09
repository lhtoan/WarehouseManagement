const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
          sp.id AS san_pham_id,
          sp.ma_san_pham,
          sp.ten_san_pham,
          
          bt.id AS bien_the_id,
          s.ten_size,
          m.ten_mau,
          bt.hinh_anh AS hinh_anh_bien_the,
          
          btlh.gia_ban,
          btlh.so_luong,
          
          lh.ngay_nhap
        FROM san_pham sp
        JOIN bien_the_san_pham bt ON bt.san_pham_id = sp.id
        JOIN size s ON s.id = bt.size_id
        JOIN mau m ON m.id = bt.mau_id
        JOIN bien_the_lo_hang btlh ON btlh.bien_the_id = bt.id
        JOIN lo_hang lh ON lh.id = btlh.lo_hang_id
        ORDER BY sp.id, bt.id, lh.ngay_nhap
      `);
      const productsMap = new Map();
  
      for (const row of rows) {
        const {
          san_pham_id,
          ma_san_pham,
          ten_san_pham,
          bien_the_id,
          ten_size,
          ten_mau,
          hinh_anh_bien_the,
          gia_ban,
          so_luong,
          ngay_nhap
        } = row;
  
        if (!productsMap.has(san_pham_id)) {
          productsMap.set(san_pham_id, {
            ma_san_pham,
            ten_san_pham,
            bien_the: []
          });
        }
  
        const product = productsMap.get(san_pham_id);
  
        let variant = product.bien_the.find(bt => bt.bien_the_id === bien_the_id);
        if (!variant) {
          variant = {
            bien_the_id,
            size: ten_size,
            mau: ten_mau,
            hinh_anh: hinh_anh_bien_the,
            lo_hang: []
          };
          product.bien_the.push(variant);
        }
  
        variant.lo_hang.push({
          gia_ban,
          so_luong,
          ngay_nhap
        });
      }
  
      const result = Array.from(productsMap.values());
  
      res.json(result);
    } catch (error) {
      console.error('Lỗi truy xuất sản phẩm:', error);
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  };
  

// // POST /products
// // controllers/product.controller.js
exports.createProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { ma_san_pham, ten_san_pham } = req.body;

    // Kiểm tra mã sản phẩm đã tồn tại chưa
    const [existing] = await connection.execute(
      'SELECT ma_san_pham FROM san_pham WHERE ma_san_pham = ?',
      [ma_san_pham]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mã sản phẩm đã tồn tại' });
    }

    // Chèn sản phẩm mới (chỉ 2 cột)
    const [result] = await connection.execute(
      'INSERT INTO san_pham (ma_san_pham, ten_san_pham) VALUES (?, ?)',
      [ma_san_pham, ten_san_pham]
    );

    res.status(201).json({
      message: 'Tạo sản phẩm thành công',
      san_pham_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server khi tạo sản phẩm' });
  } finally {
    connection.release();
  }
};


exports.addVariant = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id: san_pham_id } = req.params;
    const { mau_sac, size, gia_ban, so_luong, lo_hang_id } = req.body;
    const hinh_anh = req.file ? req.file.filename : null;

    await connection.beginTransaction();

    // Kiểm tra sản phẩm tồn tại không
    const [sanPhamRows] = await connection.execute(
      'SELECT id FROM san_pham WHERE id = ?',
      [san_pham_id]
    );
    if (sanPhamRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Sản phẩm không tồn tại' });
    }

    // Kiểm tra size tồn tại
    const [sizeRows] = await connection.execute(
      'SELECT id FROM size WHERE ten_size = ?',
      [size]
    );
    if (sizeRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: `Size ${size} không tồn tại` });
    }
    const size_id = sizeRows[0].id;

    // Kiểm tra màu tồn tại
    const [mauRows] = await connection.execute(
      'SELECT id FROM mau WHERE ten_mau = ?',
      [mau_sac]
    );
    if (mauRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: `Màu ${mau_sac} không tồn tại` });
    }
    const mau_id = mauRows[0].id;

    // Kiểm tra lô hàng tồn tại
    const [loHangRows] = await connection.execute(
      'SELECT id FROM lo_hang WHERE id = ?',
      [lo_hang_id]
    );
    if (loHangRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: `Lô hàng ID ${lo_hang_id} không tồn tại` });
    }

    // Tạo biến thể sản phẩm
    const [resultBienThe] = await connection.execute(
      'INSERT INTO bien_the_san_pham (san_pham_id, size_id, mau_id, hinh_anh) VALUES (?, ?, ?, ?)',
      [san_pham_id, size_id, mau_id, hinh_anh]
    );
    const bien_the_id = resultBienThe.insertId;

    // Gắn biến thể vào lô hàng với giá và số lượng
    await connection.execute(
      'INSERT INTO bien_the_lo_hang (bien_the_id, lo_hang_id, gia_ban, so_luong) VALUES (?, ?, ?, ?)',
      [bien_the_id, lo_hang_id, gia_ban, so_luong]
    );

    await connection.commit();
    res.status(201).json({ message: 'Thêm biến thể thành công', bien_the_id });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi thêm biến thể' });
  } finally {
    connection.release();
  }
};
