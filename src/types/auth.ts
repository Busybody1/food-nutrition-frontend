/**
 * Authentication types
 */

import { Plan } from './api'

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  plan_id: number;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
  plan?: Plan;
}

// Plan interface is defined in api.ts

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ApiKey {
  id: number;
  name: string;
  key?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface CreateApiKeyRequest {
  name: string;
}
