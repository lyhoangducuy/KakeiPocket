import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Role,
} from "../types/auth";

interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;

  login: (data: LoginRequest) => Promise<void>;

  register: (
    data: RegisterRequest
  ) => Promise<RegisterResponse>;

  logout: () => Promise<void>;

  isAuthenticated: boolean;

  isAdmin: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] =
    useState<LoginResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  // Kiểm tra session khi F5
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response =
        await api.get("/auth/me");

      setUser(response.data.result);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    data: LoginRequest
  ) => {
    const response =
      await api.post("/auth/login", data);

    const result: LoginResponse =
      response.data.result;

    setUser(result);
  };

  const register = async (
    data: RegisterRequest
  ) => {
    const response =
      await api.post("/auth/register", data);

    return response.data.result;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated =
    user !== null;

  const isAdmin =
    user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}