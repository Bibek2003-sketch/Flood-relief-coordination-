import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | any;
  roleName?: string;
  organization?: string;
  status?: string;
  contactNumber?: string;
  isAvailable?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    // Check for saved user on mount
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.firstName === 'Google' && parsed?.lastName === 'User' && parsed?._id === 'google-mock-id') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        } else {
          setUser(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem('user');
        setToken(null);
      }
    }
  }, []);

  const login = (userData: User, tokenStr: string) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenStr);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
