import type { AiFinancialAnalysis } from "../types/aiFinancial";

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

export const demoAiAnalysis: AiFinancialAnalysis = {
  year,
  month,
  summary:
    "Tháng này bạn đã tiết kiệm tốt với tỷ lệ tiết kiệm 36.67%. Tuy nhiên, 3/4 ví đã sử dụng hết ngân sách, cần thận trọng cho các ngày còn lại.",
  financialHealth: "GOOD",
  keyInsights: [
    "Tổng thu nhập đạt 15.000.000 ₫, bằng 100% mục tiêu tháng.",
    "Chi tiêu ở mức 9.500.000 ₫, chiếm 63.33% thu nhập.",
    "Tiết kiệm đạt 5.500.000 ₫, vượt mục tiêu 100%.",
    "Tiền thuê nhà và tiền ăn chiếm hơn 56% tổng chi tiêu — đây là các khoản chi tiêu cố định.",
  ],
  warnings: [
    "Ví NECESSARY, CULTURE, UNEXPECTED đã sử dụng 100% ngân sách.",
    "Chỉ còn ví WANTS còn dư 1.200.000 ₫ cho phần còn lại của tháng.",
  ],
  recommendations: [
    "Hạn chế chi tiêu trong ví WANTS cho 1-2 tuần tới.",
    "Cân nhắc giảm ngân sách NECESSARY 10% vào tháng sau nếu có thể.",
    "Tiết kiệm thêm 500.000 ₫ cho mục tiêu dài hạn.",
  ],
  savingSuggestions: [
    "Nấu ăn tại nhà thêm 3 bữa/tuần để giảm chi phí ăn uống.",
    "Sử dụng phương tiện công cộng 2-3 lần/tuần thay vì đi xe máy.",
    "Tìm kiếm các chương trình khuyến mãi cho mua sắm thiết yếu.",
  ],
  nextMonthGoals: [
    "Giữ tỷ lệ tiết kiệm ≥ 30%.",
    "Không để ví nào vượt 95% ngân sách.",
    "Tăng thu nhập thêm 1.000.000 ₫ từ freelance.",
  ],
  generatedForQuestion: false,
  question: null,
};
