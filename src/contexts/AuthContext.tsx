import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  updateInterests: (interests: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('podnotes_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    // Simulated login - in production, this would call Firebase
    const users = JSON.parse(localStorage.getItem('podnotes_users') || '{}');
    
    if (!users[email]) {
      return { error: 'No account found with this email' };
    }
    
    if (users[email].password !== password) {
      return { error: 'Incorrect password' };
    }

    const userData: User = {
      id: users[email].id,
      email,
      interests: users[email].interests || [],
      createdAt: new Date(users[email].createdAt),
    };

    setUser(userData);
    localStorage.setItem('podnotes_user', JSON.stringify(userData));
    return {};
  };

  const signup = async (email: string, password: string): Promise<{ error?: string }> => {
    // Simulated signup - in production, this would call Firebase
    const users = JSON.parse(localStorage.getItem('podnotes_users') || '{}');
    
    if (users[email]) {
      return { error: 'An account with this email already exists' };
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      interests: [],
      createdAt: new Date().toISOString(),
    };

    users[email] = newUser;
    localStorage.setItem('podnotes_users', JSON.stringify(users));

    const userData: User = {
      id: newUser.id,
      email,
      interests: [],
      createdAt: new Date(),
    };

    setUser(userData);
    localStorage.setItem('podnotes_user', JSON.stringify(userData));
    return {};
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('podnotes_user');
  };

  const updateInterests = (interests: string[]) => {
    if (user) {
      const updatedUser = { ...user, interests };
      setUser(updatedUser);
      localStorage.setItem('podnotes_user', JSON.stringify(updatedUser));

      // Also update in users storage
      const users = JSON.parse(localStorage.getItem('podnotes_users') || '{}');
      if (users[user.email]) {
        users[user.email].interests = interests;
        localStorage.setItem('podnotes_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateInterests }}>
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
