import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../hook/store';

const PublicRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

 
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
