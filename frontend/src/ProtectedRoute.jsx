import { Navigate, useLocation, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = sessionStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
