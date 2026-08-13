import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "../context/AuthContext";

import LoginRequiredModal from "./LoginRequiredModal";

interface LoginRequiredContextValue {
  requireAuth: (intent?: string) => boolean;
}

const LoginRequiredContext =
  createContext<LoginRequiredContextValue | undefined>(undefined);

export function LoginRequiredProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<string | undefined>(undefined);

  const requireAuth = useCallback(
    (nextIntent?: string): boolean => {
      if (isAuthenticated) return true;
      setIntent(nextIntent);
      setOpen(true);
      return false;
    },
    [isAuthenticated]
  );

  const value = useMemo(() => ({ requireAuth }), [requireAuth]);

  return (
    <LoginRequiredContext.Provider value={value}>
      {children}
      <LoginRequiredModal
        open={open}
        intent={intent}
        onClose={() => setOpen(false)}
      />
    </LoginRequiredContext.Provider>
  );
}

export function useLoginRequired(): LoginRequiredContextValue {
  const ctx = useContext(LoginRequiredContext);
  if (!ctx) {
    throw new Error(
      "useLoginRequired must be used inside LoginRequiredProvider"
    );
  }
  return ctx;
}

export function useRequireAuth() {
  return useLoginRequired().requireAuth;
}
