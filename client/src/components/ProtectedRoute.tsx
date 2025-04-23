import * as ReactDOM from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: number[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const allowedRolesSet = new Set(allowedRoles);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !allowedRolesSet.has(user.role)) {
    return <ReactDOM.Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;