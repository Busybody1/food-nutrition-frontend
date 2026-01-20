/**
 * Custom hook for authentication state management
 */

import { useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '@/types/auth';
import { apiClient } from '@/lib/api/client';

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export interface UseAuthReturn {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string; user?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setApiKey: (apiKey: string | null) => void;
  getApiKey: () => string | null;
  
  // Utilities
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

  // Computed properties
  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          console.log('Found token, verifying with /api/v1/auth/me');
          // Verify token and get user data
          const response = await apiClient.get<User>('/api/v1/auth/me');
          console.log('Auth me response:', response.data);
          if (response.data) {
            setUser(response.data);
          }
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.log('Token verification failed:', error);
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
      const { access_token, refresh_token, user: userData } = response.data;

      console.log('Login response user data:', userData);

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Update API client with new token
      apiClient.setAccessToken(access_token);

      setUser(userData);
      return { success: true, user: userData };
    } catch (err: unknown) {
      const errorMessage = (err as ApiError)?.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterRequest): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Update API client with new token
      apiClient.setAccessToken(access_token);

      setUser(userData);
      return { success: true, user: userData };
    } catch (err: unknown) {
      const errorMessage = (err as ApiError)?.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear token from API client
    apiClient.setAccessToken(null);
    
    setUser(null);
    setError(null);
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) return false;

      const response = await apiClient.post<{ access_token: string }>('/api/v1/auth/refresh', {
        refresh_token_value: refreshTokenValue // Fixed: backend expects refresh_token_value
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      
      // Update API client with new token
      apiClient.setAccessToken(access_token);
      
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  // Update profile function
  const updateProfile = useCallback(async (data: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put<User>('/api/v1/users/profile', data); // Fixed: /users/ (plural)
      const updatedUser = response.data;

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err: unknown) {
      const errorMessage = (err as ApiError)?.response?.data?.detail || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.post('/api/v1/users/change-password', { // Fixed: /users/ (plural) and POST method
        current_password: currentPassword,
        new_password: newPassword
      });

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = (err as ApiError)?.response?.data?.detail || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // API Key management
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

  // Utility functions
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
    
    // Admin permissions
    if (user.is_admin) {
      const adminPermissions = [
        'manage_users',
        'manage_plans',
        'view_analytics',
        'manage_content'
      ];
      return adminPermissions.includes(permission);
    }
    
    // Regular user permissions
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
    // State
    user,
    loading,
    isAuthenticated,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    setApiKey,
    getApiKey,
    
    // Utilities
    hasRole,
    hasPermission,
    isEmailVerified,
    getFullName,
    getInitials
  };
};

export default useAuth;