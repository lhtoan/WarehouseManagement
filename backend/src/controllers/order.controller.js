const db = require('../config/db');

// Hàm tạo mã đơn hàng
function taoMaHoaDon(soDienThoai) {
  const soCuoi = soDienThoai.slice(-3);

  const now = new Date();
  const ngay = String(now.getDate()).padStart(2, '0');
  const thang = String(now.getMonth() + 1).padStart(2, '0');
  const giay = String(now.getSeconds()).padStart(2, '0');

  return `${soCuoi}${ngay}${thang}${giay}`;
}


exports.createOrder = async (req, res) => {
  const {
    ten_khach_hang,
    so_dien_thoai,
    dia_chi,
    ghi_chu,
    don_vi_vc_id,
    items,
    tong_tien
  } = req.body;

  const connection = await db.getConnection(); // lấy kết nối DB

  try {
    await connection.beginTransaction();

    // Tạo mã hóa đơn
    const ma_hoa_don = taoMaHoaDon(so_dien_thoai);

    // 1. Tạo đơn hàng
    const [orderResult] = await connection.execute(
      `INSERT INTO don_hang 
        (ma_hoa_don, ten_khach_hang, so_dien_thoai, dia_chi, ghi_chu, tong_tien, don_vi_vc_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ma_hoa_don,
        ten_khach_hang,
        so_dien_thoai,
        dia_chi,
        ghi_chu || null,
        tong_tien,
        don_vi_vc_id
      ]
    );

    const ma_don_hang = orderResult.insertId;

    // 2. Thêm từng chi tiết đơn hàng
    for (const item of items) {
      const [resLoHang] = await connection.execute(
        `SELECT l.id 
         FROM bien_the_lo_hang btlh
         JOIN lo_hang l ON btlh.lo_hang_id = l.id
         WHERE btlh.bien_the_id = ?
         ORDER BY l.ngay_nhap DESC 
         LIMIT 1`,
        [item.bien_the_id]
      );

      if (!resLoHang.length) {
        throw new Error(`Không tìm thấy lô hàng cho biến thể ID ${item.bien_the_id}`);
      }

      const lo_hang_id = resLoHang[0].id;

      await connection.execute(
        `INSERT INTO chi_tiet_don_hang
         (ma_don_hang, lo_hang_id, so_luong, don_gia)
         VALUES (?, ?, ?, ?)`,
        [ma_don_hang, lo_hang_id, item.quantity, item.gia_ban]
      );
    }

    // 3. Ghi trạng thái đơn hàng: "Đã đóng gói"
    await connection.execute(
      `INSERT INTO lich_su_trang_thai_don_hang
         (ma_don_hang, trang_thai, nguoi_cap_nhat)
       VALUES (?, ?, ?)`,
      [ma_don_hang, "Đã đóng gói", 1]
    );

    await connection.commit();
    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      ma_don_hang,
      ma_hoa_don
    });
  } catch (err) {
    await connection.rollback();
    console.error("Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: err.message
    });
  } finally {
    connection.release(); // giải phóng kết nối
  }
};

exports.getAllOrdersWithDetails = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        dh.ma_don_hang,
        dh.ma_hoa_don,
        dh.ten_khach_hang,
        dh.so_dien_thoai,
        dh.dia_chi,
        dh.ghi_chu,
        dh.tong_tien,
        dh.ngay_tao,
        dvvc.ten_don_vi AS don_vi_van_chuyen,
        ls.trang_thai,
        sp.ten_san_pham,
        sz.ten_size,
        m.ten_mau,
        ctdh.so_luong,
        ctdh.don_gia
      FROM don_hang dh
      JOIN don_vi_van_chuyen dvvc ON dh.don_vi_vc_id = dvvc.id
      LEFT JOIN (
        SELECT lst1.*
        FROM lich_su_trang_thai_don_hang lst1
        JOIN (
          SELECT ma_don_hang, MAX(thoi_gian) AS max_time
          FROM lich_su_trang_thai_don_hang
          GROUP BY ma_don_hang
        ) lst2 ON lst1.ma_don_hang = lst2.ma_don_hang AND lst1.thoi_gian = lst2.max_time
      ) ls ON dh.ma_don_hang = ls.ma_don_hang
      JOIN chi_tiet_don_hang ctdh ON dh.ma_don_hang = ctdh.ma_don_hang
      JOIN lo_hang lh ON ctdh.lo_hang_id = lh.id
      JOIN bien_the_lo_hang btlh ON btlh.lo_hang_id = lh.id
      JOIN bien_the_san_pham btsp ON btsp.id = btlh.bien_the_id
      JOIN san_pham sp ON sp.id = btsp.san_pham_id
      JOIN size sz ON sz.id = btsp.size_id
      JOIN mau m ON m.id = btsp.mau_id
      ORDER BY dh.ma_don_hang DESC;
    `);

    // Gom đơn hàng theo ma_don_hang
    const donHangs = {};

    for (const row of rows) {
      const ma = row.ma_don_hang;
      if (!donHangs[ma]) {
        donHangs[ma] = {
          ma_don_hang: ma,
          ma_hoa_don: row.ma_hoa_don,
          ten_khach_hang: row.ten_khach_hang,
          so_dien_thoai: row.so_dien_thoai,
          dia_chi: row.dia_chi,
          ghi_chu: row.ghi_chu,
          tong_tien: row.tong_tien,
          ngay_tao: row.ngay_tao,
          don_vi_van_chuyen: row.don_vi_van_chuyen,
          trang_thai: row.trang_thai,
          chi_tiet: []
        };
      }

      donHangs[ma].chi_tiet.push({
        ten_san_pham: row.ten_san_pham,
        ten_size: row.ten_size,
        ten_mau: row.ten_mau,
        so_luong: row.so_luong,
        don_gia: row.don_gia
      });
    }

    res.json(Object.values(donHangs));
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};