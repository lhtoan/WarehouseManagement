import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/'); 
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <h2>MINI STORE</h2>
        <ul>
          <li>
            <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-active' : ''}>
              Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-active' : ''}>
              Sản phẩm
            </NavLink>
          </li>
          <li>
            <NavLink to="/order" className={({ isActive }) => isActive ? 'nav-active' : ''}>
              Đặt hàng
            </NavLink>
          </li>
          <li>
            <NavLink to="/invoices" className={({ isActive }) => isActive ? 'nav-active' : ''}>
              Đơn hàng
            </NavLink>
          </li>
          {/* <li>
            <NavLink to="/member" className={({ isActive }) => isActive ? 'nav-active' : ''}>
              Nhân viên
            </NavLink>
          </li> */}
          <li>
            <NavLink to="/warehouse" className={({ isActive }) => isActive ? 'nav-active' : ''}>
              Cài đặt
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="logout-section">
        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
      </div>
    </div>
  );
}
