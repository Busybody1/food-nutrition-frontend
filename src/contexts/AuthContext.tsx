'use client'

/**
 * Authentication context for managing user state across the application
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { User } from '@/types/auth';

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string; user?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setApiKey: (apiKey: string | null) => void;
  getApiKey: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
