

import { useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '@/types/auth';
import { apiClient } from '@/lib/api/client';
import { clearStashedApiKeys } from '@/lib/api/api-keys';

import { ApiError } from '@/types/api';

export interface UseAuthReturn {

  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string; user?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setApiKey: (apiKey: string | null) => void;
  getApiKey: () => string | null;

  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isEmailVerified: () => boolean;
  getFullName: () => string;
  getInitials: () => string;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await apiClient.get<User>('/api/v1/auth/me');
          if (response.data) {
            setUser(response.data);
          }
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
      const { access_token, refresh_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      apiClient.setAccessToken(access_token);

      setUser(userData);
      return { success: true, user: userData };
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
      const loginResult = await login({ email: data.email, password: data.password });
      if (!loginResult.success) {
        return {
          success: false,
          error: loginResult.error || 'Account created. Please sign in.',
        };
      }
      return loginResult;
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearStashedApiKeys();

    apiClient.setAccessToken(null);

    setUser(null);
    setError(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) return false;

      const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/refresh', {
        refresh_token_value: refreshTokenValue
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);

      apiClient.setAccessToken(access_token);

      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put<User>('/api/v1/users/profile', data);
      const updatedUser = response.data;

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);

      const response = await apiClient.post<{
        access_token?: string;
        refresh_token?: string;
      }>('/api/v1/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });

      const accessToken = response.data.access_token;
      const refreshTokenValue = response.data.refresh_token;
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        apiClient.setAccessToken(accessToken);
      }
      if (refreshTokenValue) {
        localStorage.setItem('refresh_token', refreshTokenValue);
      }

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof ApiError ? err.message : 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const setApiKey = useCallback((apiKey: string | null) => {
    if (apiKey) {
      localStorage.setItem('api_key', apiKey);
    } else {
      localStorage.removeItem('api_key');
    }
  }, []);

  const getApiKey = useCallback((): string | null => {
    return localStorage.getItem('api_key');
  }, []);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;

    switch (role.toLowerCase()) {
      case 'admin':
        return user.is_admin;
      case 'user':
        return true;
      default:
        return false;
    }
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    if (user.is_admin) {
      const adminPermissions = [
        'manage_users',
        'manage_plans',
        'view_analytics',
        'manage_content'
      ];
      return adminPermissions.includes(permission);
    }

    const userPermissions = [
      'view_profile',
      'edit_profile',
      'manage_subscription',
      'view_usage',
      'create_api_keys'
    ];
    return userPermissions.includes(permission);
  }, [user]);

  const isEmailVerified = useCallback((): boolean => {
    return user?.email_verified || false;
  }, [user]);

  const getFullName = useCallback((): string => {
    if (!user) return '';

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return user.email || 'User';
    }
  }, [user]);

  const getInitials = useCallback((): string => {
    if (!user) return 'U';

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else {
      return user.email?.charAt(0).toUpperCase() || 'U';
    }
  }, [user]);

  return {

    user,
    loading,
    isAuthenticated,
    error,

    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    setApiKey,
    getApiKey,

    hasRole,
    hasPermission,
    isEmailVerified,
    getFullName,
    getInitials
  };
};

export default useAuth;