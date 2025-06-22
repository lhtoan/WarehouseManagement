import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getAllOrdersWithDetails, updateOrderStatus } from '../../services/orderService';
import './Invoice.css';

const STATUS_OPTIONS = [
  { label: 'Đã đóng gói', value: 'Đã đóng gói', color: '#0D92F4' },
  { label: 'Giao cho đơn vị VC', value: 'Chuyển đơn vị VC', color: '#FF7601' },
  { label: 'Đang giao', value: 'Đang giao', color: '#129990' },
  { label: 'Giao thành công', value: 'Giao thành công', color: '#16C47F' },
  { label: 'Hủy', value: 'Hủy', color: '#F95454' }
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: state.selectProps.value?.color || '#ccc',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    minHeight: '38px',
    boxShadow: 'none',
    cursor: 'pointer',
    zIndex: 2
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
    fontWeight: 'bold'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused || state.isSelected ? state.data.color : 'white',
    color: state.isFocused || state.isSelected ? 'white' : 'black',
    cursor: 'pointer'
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 })
};

export default function Invoice() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAllOrdersWithDetails();
        setOrders(data);
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (ma_don_hang, selectedOption) => {
    const newStatus = selectedOption.value;
    try {
      setOrders(prev =>
        prev.map(order =>
          order.ma_don_hang === ma_don_hang
            ? { ...order, trang_thai: newStatus }
            : order
        )
      );
      await updateOrderStatus(ma_don_hang, newStatus);
      showToast(`Đã cập nhật trạng thái đơn hàng!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // 🔽 Sắp xếp: 'Giao thành công' xuống cuối danh sách
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.trang_thai === 'Giao thành công' && b.trang_thai !== 'Giao thành công') return 1;
    if (a.trang_thai !== 'Giao thành công' && b.trang_thai === 'Giao thành công') return -1;
    return 0;
  });

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>

      {toast.visible && (
        <div className={`toast-popup ${toast.type} ${toast.visible ? '' : 'hide'}`}>
          {toast.message}
        </div>
      )}

      <table className="order-table">
        <thead>
          <tr>
            <th>Mã HĐ</th>
            <th>Thông tin đơn hàng</th>
            <th>Đơn vị VC</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map(order => {
            const selectedOption = STATUS_OPTIONS.find(opt => opt.value === order.trang_thai);
            return (
              <tr key={order.ma_don_hang}>
                <td>{order.ma_hoa_don}</td>
                <td>
                  <strong>Họ tên khách:</strong> {order.ten_khach_hang}<br />
                  <strong>SĐT:</strong> {order.so_dien_thoai}<br />
                  <strong>Địa chỉ:</strong> {order.dia_chi}<br />
                  <strong>Ghi chú:</strong> {order.ghi_chu || 'Không có'}<br />
                  <strong>Tổng tiền:</strong> {Number(order.tong_tien).toLocaleString()}đ<br />
                  <strong>Ngày tạo:</strong> {new Date(order.ngay_tao).toLocaleString()}<br />
                  <ul>
                    {order.chi_tiet.map((item, idx) => (
                      <li key={idx}>
                        {item.ten_san_pham} - {item.ten_size} - {item.ten_mau} - SL: {item.so_luong} - {Number(item.don_gia).toLocaleString()}đ
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{order.don_vi_van_chuyen}</td>
                <td>
                  <Select
                    value={selectedOption}
                    onChange={(option) => handleStatusChange(order.ma_don_hang, option)}
                    options={STATUS_OPTIONS}
                    styles={customSelectStyles}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
