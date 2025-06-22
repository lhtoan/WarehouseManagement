import React, { useState } from 'react';
import { getOrderStatusHistory } from '../../services/orderService';
import './UserSearch.css';

const STATUS_LIST = [
  { label: 'Đã đóng gói', value: 'Đã đóng gói' },
  { label: 'Chuyển đơn vị VC', value: 'Chuyển đơn vị VC' },
  { label: 'Đang giao', value: 'Đang giao' },
  { label: 'Giao thành công', value: 'Giao thành công' },
  { label: 'Hủy', value: 'Hủy' }
];

export default function UserSearch() {
  const [maHoaDon, setMaHoaDon] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedMaHoaDon, setSearchedMaHoaDon] = useState('');

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getOrderStatusHistory(maHoaDon.trim());
      const sortedHistory = data.lich_su.sort((a, b) => new Date(b.thoi_gian) - new Date(a.thoi_gian));
  
      if (sortedHistory.length === 0) {
        setHistory([]);
        setError('Không tìm thấy đơn hàng. Vui lòng nhập lại mã đơn hàng!');
      } else {
        setHistory(sortedHistory);
        setSearchedMaHoaDon(maHoaDon.trim());
      }
    } catch {
      setHistory([]);
      setError('Không tìm thấy đơn hàng. Vui lòng nhập lại mã đơn hàng!');
    }
    setLoading(false);
  };
  

  const getCurrentStep = () => {
    const statusOrder = STATUS_LIST.map(s => s.value);
    const latest = history[0]?.trang_thai;
    return statusOrder.indexOf(latest) + 1;
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
      {error && <h3 className="not-found-message">{error}</h3>}


      {history.length > 0 && (
        <div className="result-section">
          <h3>Kết quả cho hóa đơn: <strong>{searchedMaHoaDon}</strong></h3>

          {/* Step Progress Bar */}
          <div className="step-progress">
            {STATUS_LIST.map((step, index) => (
              <div
                key={index}
                className={`step-item ${getCurrentStep() > index ? 'active' : ''}`}
              >
                <div className="step-icon"></div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="timeline-container">
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`timeline-item ${idx === 0 ? 'latest' : ''}`}
              >
                <div className="timeline-time">
                  {new Date(item.thoi_gian).toLocaleTimeString()}<br />
                  {new Date(item.thoi_gian).toLocaleDateString()}
                </div>
                <div className="timeline-circle" />
                <div className="timeline-content">{item.trang_thai}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
