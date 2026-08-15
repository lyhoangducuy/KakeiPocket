export interface SystemConfig {
  warningThreshold: number;
  dangerThreshold: number;
}

export interface UpdateSystemConfigRequest {
  warningThreshold: number;
  dangerThreshold: number;
}
