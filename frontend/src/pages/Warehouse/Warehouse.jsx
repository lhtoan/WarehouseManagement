import { useEffect, useState } from 'react';
import { fetchBatches, addBatch } from '../../services/batchesService';
import { createSize, createColor, fetchSizes, fetchColors } from '../../services/productService';


import './Warehouse.css';

// Hàm lấy ngày hiện tại ở định dạng 'YYYY-MM-DD'
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function WareHouse() {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);


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
  
    async function loadSizesAndColors() {
      try {
        const sizeData = await fetchSizes();
        const colorData = await fetchColors();
        setSizes(sizeData);
        setColors(colorData);
      } catch (err) {
        console.error('Lỗi khi tải size/màu:', err);
      }
    }
  
    loadBatches();
    loadSizesAndColors();
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

  const handleAddSize = async () => {
    try {
      await createSize(newSize);
      alert('Thêm size thành công');
      setNewSize('');
      const updatedSizes = await fetchSizes(); // cập nhật lại bảng
      setSizes(updatedSizes);
    } catch (err) {
      alert(err.message || 'Lỗi khi thêm size');
    }
  };
  
  const handleAddColor = async () => {
    try {
      await createColor(newColor);
      alert('Thêm màu thành công');
      setNewColor('');
      const updatedColors = await fetchColors(); // cập nhật lại bảng
      setColors(updatedColors);
    } catch (err) {
      alert(err.message || 'Lỗi khi thêm màu');
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
      
      <div className="add-attribute-section">
        <h2>Thêm Size</h2>
        <div className="form-group-warehouse">
          <label>Tên size</label>
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
          />
          <button className="btn btn-save" onClick={handleAddSize}>Thêm Size</button>
        </div>
        
        <h2>Danh sách Size</h2>
        <table className="batch-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên size</th>
            </tr>
          </thead>
          <tbody>
          {sizes.map((size) => (
            <tr key={size.gia_tri_id}>
              <td>{size.gia_tri_id}</td>
              <td>{size.gia_tri}</td>
            </tr>
          ))}


          </tbody>
        </table>

        <h2>Thêm Màu</h2>
        <div className="form-group-warehouse">
          <label>Tên màu</label>
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
          <button className="btn btn-save" onClick={handleAddColor}>Thêm Màu</button>
        </div>
        
        <h2>Danh sách Màu</h2>
        <table className="batch-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên màu</th>
            </tr>
          </thead>
          <tbody>
          {colors.map((color) => (
            <tr key={color.gia_tri_id}>
              <td>{color.gia_tri_id}</td>
              <td>{color.gia_tri}</td>
            </tr>
          ))}

          </tbody>
        </table>

      </div>


      {/* Popup thêm lô hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Thêm lô hàng mới</h2>
            <form onSubmit={handleAddBatch}>
              <div className="form-group-warehouse">
                <label>Mã lô</label>
                <input
                  type="text"
                  value={maLo}
                  onChange={e => setMaLo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-warehouse">
                <label>Ngày nhập</label>
                <input
                  type="date"
                  value={ngayNhap}
                  onChange={e => setNgayNhap(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions-warehouse">
                <button type="button" className="btn btn-cancel" onClick={() => setShowPopup(false)}>Hủy</button>
                <button type="submit" className="btn btn-save">Lưu</button>
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
