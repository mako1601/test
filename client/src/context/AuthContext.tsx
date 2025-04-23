import * as React from 'react';
import { UserDto } from '@mytypes/userTypes';
import { getCurrentUser } from '@api/authApi';
import { refreshToken } from '@api/axiosInstance';

type AuthContextType = {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
  loading: boolean;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<UserDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        let currentUser = await getCurrentUser();
        if (!currentUser) {
          await refreshToken();
          currentUser = await getCurrentUser();
        }
        setUser(currentUser);
      } catch (e: any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};