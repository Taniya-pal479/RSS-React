import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../hook/store';

interface Props {
  adminOnly?: boolean;
}

const ProtectedRoute = ({ adminOnly = false }: Props) => {
  const { isAuthenticated, type } = useAppSelector((state) => state.auth);
 
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
 
  if (adminOnly && type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
