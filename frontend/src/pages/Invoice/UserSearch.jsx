import React, { useState } from 'react';
import { getOrderStatusHistory } from '../../services/orderService';
import './UserSearch.css';

const STATUS_LIST = [
  'Đã đóng gói',
  'Chuyển đơn vị VC',
  'Đang giao',
  'Giao thành công',
  'Hủy'
];

export default function UserSearch() {
  const [maHoaDon, setMaHoaDon] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getOrderStatusHistory(maHoaDon.trim());
      setHistory(data.lich_su);
    } catch (err) {
      setHistory([]);
      setError(err.message);
    }
    setLoading(false);
  };

  const getTimeForStatus = (status) => {
    const match = history.find(item => item.trang_thai === status);
    return match ? new Date(match.thoi_gian).toLocaleString() : null;
  };

  return (
    <div className="search-container">
      <h2>Tra cứu trạng thái đơn hàng</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Nhập mã hóa đơn"
          value={maHoaDon}
          onChange={(e) => setMaHoaDon(e.target.value)}
        />
        <button onClick={handleSearch}>Tra cứu</button>
      </div>

      {loading && <p className="loading">Đang tra cứu...</p>}
      {error && <p className="error">{error}</p>}

      {history.length > 0 && (
        <div className="result-section">
          <h3>Kết quả cho hóa đơn: <strong>{maHoaDon}</strong></h3>
          <ul className="status-list">
            {STATUS_LIST.map((status, idx) => {
              const time = getTimeForStatus(status);
              const isReached = !!time;

              return (
                <li
                  key={idx}
                  className={`status-item ${isReached ? 'reached' : ''}`}
                >
                  <div className="status-name">{status}</div>
                  {time && (
                    <div className="status-time">
                      Cập nhật lúc: {time}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
