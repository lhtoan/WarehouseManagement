import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>MINI STORE</h2>
      <ul>
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => isActive ? 'nav-active' : ''}
          >
            Trang chủ
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products"
            className={({ isActive }) => isActive ? 'nav-active' : ''}
          >
            Sản phẩm
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/warehouse"
            className={({ isActive }) => isActive ? 'nav-active' : ''}
          >
            Kho hàng
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/order"
            className={({ isActive }) => isActive ? 'nav-active' : ''}
          >
            Đặt hàng
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/invoices"
            className={({ isActive }) => isActive ? 'nav-active' : ''}
          >
            Đơn hàng
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
