import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../models/types';
import { authService } from '../services/authService';
import { GoogleUserProfile } from '../services/googleAuthService';

interface AuthContextType {
  currentUser: User;
  isLoading: boolean;
  login: (email: string) => Promise<User>;
  loginWithGoogle: (profile: GoogleUserProfile, role?: Role) => Promise<User>;
  register: (data: { displayName: string; email: string; role: Role; averageCycleDays?: number; phone?: string }) => Promise<User>;
  switchRole: (role: Role) => Promise<User>;
  updateUser: (updates: Partial<User>) => Promise<User>;
  deductWalletBalance: (amountInr: number) => Promise<User>;
  addWalletBalance: (amountInr: number) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const login = async (email: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.login(email);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (profile: GoogleUserProfile, role?: Role): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGoogle(profile, role);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    displayName: string;
    email: string;
    role: Role;
    averageCycleDays?: number;
    phone?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.register(data);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: Role): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await authService.switchDemoRole(role);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<User> => {
    const user = await authService.updateUser(updates);
    setCurrentUser(user);
    return user;
  };

  const deductWalletBalance = async (amountInr: number): Promise<User> => {
    const user = await authService.deductWalletBalance(amountInr);
    setCurrentUser(user);
    return user;
  };

  const addWalletBalance = async (amountInr: number): Promise<User> => {
    const user = await authService.addWalletBalance(amountInr);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(authService.getCurrentUser());
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        loginWithGoogle,
        register,
        switchRole,
        updateUser,
        deductWalletBalance,
        addWalletBalance,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
