import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api, { setUnauthorizedHandler } from "../api/axios";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

interface AuthContextType {
  user: LoginResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.result);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });

    (async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.result);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        setUnauthorizedHandler(null);
      }
    })();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", data);
    const result: LoginResponse = response.data.result;
    setUser(result);
    return result;
  };

  const register = async (
    data: RegisterRequest
  ): Promise<RegisterResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data.result;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = user !== null;
  const isGuest = !isAuthenticated && !loading;
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isGuest,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
