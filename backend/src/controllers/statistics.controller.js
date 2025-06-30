const db = require('../config/db');

exports.getRevenueByDay = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DATE(ngay_tao) AS ngay, SUM(tong_tien) AS tong_doanh_thu
      FROM don_hang
      GROUP BY DATE(ngay_tao)
      ORDER BY ngay
    `);

    res.json(rows);
  } catch (error) {
    console.error('Lỗi khi lấy doanh thu theo ngày:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi truy vấn doanh thu.' });
  }
};

exports.getTotalBillsToday = async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT COUNT(*) AS total_bills
        FROM don_hang
        WHERE DATE(ngay_tao) = CURDATE()
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching total bills today:', error);
      res.status(500).json({ message: 'Failed to fetch total bills.' });
    }
  };