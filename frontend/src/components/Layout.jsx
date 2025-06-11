// Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();

  // Kiểm tra nếu đang ở trang Order
  const isOrderPage = location.pathname === "/order";

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div
        style={{
          marginLeft: '200px',
          marginRight: isOrderPage ? '0' : '20px',
          marginBottom: '20px',
          padding: '0',
          width: '100%',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
