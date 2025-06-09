import { useEffect, useState } from 'react';
import { fetchBatches, addBatch } from '../../services/batchesService';
import './Warehouse.css';

// Hàm lấy ngày hiện tại ở định dạng 'YYYY-MM-DD'
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function Home() {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Form state
  const [maLo, setMaLo] = useState('');
  const [ngayNhap, setNgayNhap] = useState(getTodayDateString());

  useEffect(() => {
    async function loadBatches() {
      try {
        const data = await fetchBatches();
        setBatches(data);
      } catch (err) {
        setError('Không thể tải dữ liệu lô hàng.');
        console.error(err);
      }
    }

    loadBatches();
  }, []);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await addBatch({ ma_lo: maLo, ngay_nhap: ngayNhap });

      setShowPopup(false);
      setMaLo('');
      setNgayNhap(getTodayDateString());

      const updatedBatches = await fetchBatches();
      setBatches(updatedBatches);
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm lô hàng');
    }
  };

  return (
    <div className="batch-page">
      <h1>LÔ HÀNG</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button className="btn btn-add" onClick={() => setShowPopup(true)}>Thêm lô hàng mới</button>

      <table className="batch-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã lô</th>
            <th>Ngày nhập</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td>{batch.id}</td>
              <td>{batch.ma_lo}</td>
              <td>{new Date(batch.ngay_nhap).toLocaleDateString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup thêm lô hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Thêm lô hàng mới</h2>
            <form onSubmit={handleAddBatch}>
              <div className="form-group">
                <label>Mã lô</label>
                <input
                  type="text"
                  value={maLo}
                  onChange={e => setMaLo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày nhập</label>
                <input
                  type="date"
                  value={ngayNhap}
                  onChange={e => setNgayNhap(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-save">Lưu</button>
                <button type="button" className="btn btn-cancel" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>

            {/* <button className="btn btn-close" onClick={() => setShowPopup(false)}>Đóng</button> */}
          </div>
        </div>
      )}

      <h1>NHẬP HÀNG</h1>
    </div>
  );
}
