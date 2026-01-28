import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../hook/store';

const PublicRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Already logged in → go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
