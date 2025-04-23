import * as ReactDOM from 'react-router-dom';

import { useAuth } from '@context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user } = useAuth();

  return user ? <ReactDOM.Navigate to="/" replace /> : <>{children}</>;
};

export default PublicRoute