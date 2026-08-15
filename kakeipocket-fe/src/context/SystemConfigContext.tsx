import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getBudgetThresholds } from "../api/systemConfigApi";

import type { SystemConfig } from "../types/systemConfig";

interface SystemConfigContextValue {
  config: SystemConfig;
  warningThreshold: number;
  dangerThreshold: number;
  refresh: () => Promise<void>;
  loading: boolean;
}

const DEFAULT_CONFIG: SystemConfig = {
  warningThreshold: 80,
  dangerThreshold: 100,
};

const SystemConfigContext = createContext<
  SystemConfigContextValue | undefined
>(undefined);

export function SystemConfigProvider({
    children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getBudgetThresholds();
      setConfig(data);
    } catch {
      // Fall back to defaults silently; UI still works.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<SystemConfigContextValue>(
    () => ({
      config,
      warningThreshold: config.warningThreshold,
      dangerThreshold: config.dangerThreshold,
      refresh,
      loading,
    }),
    [config, refresh, loading]
  );

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig(): SystemConfigContextValue {
  const ctx = useContext(SystemConfigContext);
  if (!ctx) {
    throw new Error(
      "useSystemConfig must be used inside SystemConfigProvider"
    );
  }
  return ctx;
}
