export interface AdminDashboardSummary {
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  totalMonthlyPlans: number;
  totalWallets: number;
  newUsers: number;
  newTransactions: number;
}

export interface AdminUserGrowthPoint {
  label: string;
  count: number;
}

export interface AdminTransactionStatisticPoint {
  label: string;
  income: number;
  expense: number;
}

export interface AdminDashboardChart {
  userGrowth: AdminUserGrowthPoint[];
  transactionStatistics: AdminTransactionStatisticPoint[];
}
