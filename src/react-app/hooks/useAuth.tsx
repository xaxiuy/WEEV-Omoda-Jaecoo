import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/shared/types';
import { api } from '@/react-app/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; city?: string }) => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  city?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (api.isAuthenticated()) {
      api.getCurrentUser()
        .then(setUser)
        .catch(() => {
          api.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
  };

  const signup = async (data: SignupData) => {
    const response = await api.signup(data);
    setUser(response.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; city?: string }) => {
    const updatedUser = await api.updateProfile(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
