import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '200px', marginRight: '20px', marginBottom:'20px', padding: '0', width: '100%' }}>
        <Outlet />
      </div>
    </div>
  );
}
