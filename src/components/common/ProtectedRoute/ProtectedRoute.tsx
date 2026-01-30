import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../hook/store';

interface Props {
  adminOnly?: boolean;
}

const ProtectedRoute = ({ adminOnly = false }: Props) => {
  const { isAuthenticated, type } = useAppSelector((state) => state.auth);

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → block admin pages
  if (adminOnly && type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
