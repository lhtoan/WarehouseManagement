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


// exports.createOrder = async (req, res) => {
//   const {
//     ten_khach_hang,
//     so_dien_thoai,
//     dia_chi,
//     ghi_chu,
//     don_vi_vc_id,
//     items,
//     tong_tien
//   } = req.body;

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     const ma_hoa_don = taoMaHoaDon(so_dien_thoai);

//     // 1. Tạo đơn hàng
//     const [orderResult] = await connection.execute(
//       `INSERT INTO don_hang 
//         (ma_hoa_don, ten_khach_hang, so_dien_thoai, dia_chi, ghi_chu, tong_tien, don_vi_vc_id)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         ma_hoa_don,
//         ten_khach_hang,
//         so_dien_thoai,
//         dia_chi,
//         ghi_chu || null,
//         tong_tien,
//         don_vi_vc_id
//       ]
//     );

//     const ma_don_hang = orderResult.insertId;

//     // 2. Thêm từng chi tiết đơn hàng và cập nhật số lượng kho
//     for (const item of items) {
//       const [resLoHang] = await connection.execute(
//         `SELECT l.id, btlh.so_luong 
//          FROM bien_the_lo_hang btlh
//          JOIN lo_hang l ON btlh.lo_hang_id = l.id
//          WHERE btlh.bien_the_id = ?
//          ORDER BY l.ngay_nhap DESC 
//          LIMIT 1`,
//         [item.bien_the_id]
//       );

//       if (!resLoHang.length) {
//         throw new Error(`Không tìm thấy lô hàng cho biến thể ID ${item.bien_the_id}`);
//       }

//       const lo_hang_id = resLoHang[0].id;
//       const so_luong_hien_tai = resLoHang[0].so_luong;

//       if (so_luong_hien_tai < item.quantity) {
//         throw new Error(`Không đủ số lượng tồn kho cho biến thể ID ${item.bien_the_id}`);
//       }

//       // Thêm chi tiết đơn hàng
//       await connection.execute(
//         `INSERT INTO chi_tiet_don_hang
//          (ma_don_hang, bien_the_id, lo_hang_id, so_luong, don_gia)
//          VALUES (?, ?, ?, ?, ?)`,
//         [ma_don_hang, item.bien_the_id, lo_hang_id, item.quantity, item.gia_ban]
//       );

//       // Trừ số lượng trong kho
//       await connection.execute(
//         `UPDATE bien_the_lo_hang
//          SET so_luong = so_luong - ?
//          WHERE bien_the_id = ? AND lo_hang_id = ?`,
//         [item.quantity, item.bien_the_id, lo_hang_id]
//       );
//     }

//     // 3. Ghi trạng thái đơn hàng
//     await connection.execute(
//       `INSERT INTO lich_su_trang_thai_don_hang
//          (ma_don_hang, trang_thai, nguoi_cap_nhat)
//        VALUES (?, ?, ?)`,
//       [ma_don_hang, "Đã đóng gói", 1]
//     );

//     await connection.commit();
//     res.status(201).json({
//       message: "Tạo đơn hàng thành công",
//       ma_don_hang,
//       ma_hoa_don
//     });
//   } catch (err) {
//     await connection.rollback();
//     console.error("Lỗi khi tạo đơn hàng:", err);
//     res.status(500).json({
//       message: "Lỗi khi tạo đơn hàng",
//       error: err.message
//     });
//   } finally {
//     connection.release();
//   }
// };

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

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

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

    // 2. Xử lý từng sản phẩm
    for (const item of items) {
      let quantityNeeded = item.quantity;

      // Lấy danh sách lô hàng của biến thể, ưu tiên lô nhập sớm nhất
      const [batches] = await connection.execute(
        `SELECT l.id AS lo_hang_id, btlh.so_luong, l.ngay_nhap
         FROM bien_the_lo_hang btlh
         JOIN lo_hang l ON btlh.lo_hang_id = l.id
         WHERE btlh.bien_the_id = ?
         ORDER BY l.ngay_nhap ASC`,
        [item.bien_the_id]
      );

      let totalAvailable = batches.reduce((sum, b) => sum + b.so_luong, 0);
      if (totalAvailable < quantityNeeded) {
        throw new Error(`Không đủ hàng tồn kho cho biến thể ID ${item.bien_the_id}`);
      }

      for (const batch of batches) {
        if (quantityNeeded === 0) break;

        const usedQty = Math.min(quantityNeeded, batch.so_luong);

        // Ghi chi tiết đơn hàng
        await connection.execute(
          `INSERT INTO chi_tiet_don_hang 
           (ma_don_hang, bien_the_id, lo_hang_id, so_luong, don_gia)
           VALUES (?, ?, ?, ?, ?)`,
          [ma_don_hang, item.bien_the_id, batch.lo_hang_id, usedQty, item.gia_ban]
        );

        // Trừ tồn kho
        await connection.execute(
          `UPDATE bien_the_lo_hang 
           SET so_luong = so_luong - ? 
           WHERE bien_the_id = ? AND lo_hang_id = ?`,
          [usedQty, item.bien_the_id, batch.lo_hang_id]
        );

        quantityNeeded -= usedQty;
      }
    }

    // 3. Trạng thái đơn hàng
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
    console.error("❌ Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: err.message
    });
  } finally {
    connection.release();
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
      JOIN bien_the_san_pham btsp ON btsp.id = ctdh.bien_the_id
      JOIN san_pham sp ON sp.id = btsp.san_pham_id
      JOIN size sz ON sz.id = btsp.size_id
      JOIN mau m ON m.id = btsp.mau_id
      ORDER BY dh.ma_don_hang DESC;
    `);

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

      const chiTiet = donHangs[ma].chi_tiet;

      // Tìm xem chi tiết này đã có chưa (so sánh theo tên sản phẩm, size, màu, giá)
      const existingItem = chiTiet.find(
        (item) =>
          item.ten_san_pham === row.ten_san_pham &&
          item.ten_size === row.ten_size &&
          item.ten_mau === row.ten_mau &&
          item.don_gia === row.don_gia
      );

      if (existingItem) {
        existingItem.so_luong += row.so_luong;
      } else {
        chiTiet.push({
          ten_san_pham: row.ten_san_pham,
          ten_size: row.ten_size,
          ten_mau: row.ten_mau,
          so_luong: row.so_luong,
          don_gia: row.don_gia
        });
      }
    }

    res.json(Object.values(donHangs));
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params; // id ở đây là ma_don_hang
  const { trang_thai, nguoi_cap_nhat } = req.body;

  try {
    // Thêm bản ghi mới vào bảng lịch sử trạng thái
    await db.query(
      `INSERT INTO lich_su_trang_thai_don_hang (ma_don_hang, trang_thai, nguoi_cap_nhat)
       VALUES (?, ?, ?)`,
      [id, trang_thai, nguoi_cap_nhat]
    );

    res.status(200).json({ message: "Cập nhật trạng thái đơn hàng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng" });
  }
};

exports.getOrderStatusHistory = async (req, res) => {
  const { ma_hoa_don } = req.params;

  const sql = `
    SELECT 
        d.ma_hoa_don,
        l.trang_thai,
        l.thoi_gian,
        u.email AS nguoi_cap_nhat
    FROM 
        don_hang d
    JOIN 
        lich_su_trang_thai_don_hang l ON d.ma_don_hang = l.ma_don_hang
    LEFT JOIN 
        nguoi_dung u ON l.nguoi_cap_nhat = u.id
    WHERE 
        d.ma_hoa_don = ?
    ORDER BY 
        l.thoi_gian ASC
  `;

  try {
    const [rows] = await db.execute(sql, [ma_hoa_don]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc chưa có lịch sử trạng thái.' });
    }

    res.json({
      ma_hoa_don,
      lich_su: rows
    });
  } catch (err) {
    console.error('Lỗi truy vấn trạng thái đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
