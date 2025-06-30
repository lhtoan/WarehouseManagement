import { useEffect, useState } from 'react';
import { fetchRevenueToday, fetchTotalBillsToday } from '../../services/statisticsService';
import './Home.css';

export default function Home() {
  const [revenue, setRevenue] = useState(0);
  const [bills, setBills] = useState(0);

  const todayVN = new Date();
  todayVN.setHours(todayVN.getHours() + 7);
  const currentDate = todayVN.toLocaleDateString('vi-VN');
  const todayStr = todayVN.toISOString().split('T')[0];

  useEffect(() => {
    async function loadData() {
      try {
        const revenueData = await fetchRevenueToday();
        const billData = await fetchTotalBillsToday();

        // Tìm doanh thu đúng ngày hôm nay
        const todayRevenue = revenueData.find(item => {
          const itemDate = new Date(item.ngay);
          itemDate.setHours(itemDate.getHours() + 7);
          return itemDate.toISOString().split('T')[0] === todayStr;
        });

        setRevenue(todayRevenue ? Number(todayRevenue.tong_doanh_thu) : 0);

        // Tổng hóa đơn
        if (billData.length > 0) {
          setBills(billData[0].total_bills);
        }

      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', err);
      }
    }

    loadData();
  }, [todayStr]);

  return (
    <section className="thongke">
      <div className="header_addproduct">
        <h1>THỐNG KÊ NGÀY: {currentDate}</h1>
      </div>

      <main className="main-container">
        <div className="main-cards">
          <div className="card">
            <div className="card-inner">
              <h2>DOANH THU</h2>
            </div>
            <h1>{Number(revenue).toLocaleString('vi-VN')}đ</h1>
          </div>

          <div className="card">
            <div className="card-inner">
              <h2>ĐƠN HÀNG</h2>
            </div>
            <h1>{bills}</h1>
          </div>

        </div>
      </main>
    </section>
  );
}
