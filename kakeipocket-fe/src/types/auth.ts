export type Role = "USER" | "ADMIN";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  email: string;
  role: Role;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}