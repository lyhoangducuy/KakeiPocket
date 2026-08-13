export interface WalletLimitsResponse {
  necessary: number | null;
  wants: number | null;
  culture: number | null;
  unexpected: number | null;
}

export interface WalletLimitsRequest {
  necessary: number;
  wants: number;
  culture: number;
  unexpected: number;
}

export type WalletType = "NECESSARY" | "WANTS" | "CULTURE" | "UNEXPECTED";

export interface WalletConfig {
  type: WalletType;
  key: keyof WalletLimitsResponse;
  label: string;
  description: string;
  icon: string;
}

export const WALLET_CONFIGS: WalletConfig[] = [
  {
    type: "NECESSARY",
    key: "necessary",
    label: "Thiết yếu",
    description: "Chi phí cần thiết hàng ngày",
    icon: "🏠",
  },
  {
    type: "WANTS",
    key: "wants",
    label: "Mong muốn",
    description: "Những khoản chi không bắt buộc",
    icon: "🛒",
  },
  {
    type: "CULTURE",
    key: "culture",
    label: "Tinh thần",
    description: "Học tập, sách, phát triển bản thân",
    icon: "📚",
  },
  {
    type: "UNEXPECTED",
    key: "unexpected",
    label: "Phát sinh",
    description: "Các khoản chi bất ngờ",
    icon: "⚠️",
  },
];
