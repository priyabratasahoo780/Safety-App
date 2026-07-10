export type SafetyStatus = "Excellent" | "Good" | "Needs Improvement" | "High Risk";
export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

export interface SafetyCategoryScore {
  id: string;
  title: string;
  score: number;
  color: string;
}

export interface RiskBreakdownItem {
  id: string;
  title: string;
  description: string;
  risk: RiskLevel;
  percentage: number;
  iconName: any;
  themeColor: string;
  progressColor: string;
}

export interface SafetyRecommendation {
  id: string;
  title: string;
  description: string;
  iconName: any;
  themeColor: string;
  buttonText: string;
  actionType: 'view_tips' | 'plan_route' | 'start_timer' | 'share_now';
}

export interface SafetyAnalysisData {
  overallScore: number;
  status: SafetyStatus;
  categories: SafetyCategoryScore[];
  risks: RiskBreakdownItem[];
  recommendations: SafetyRecommendation[];
  isDemoData: boolean;
}
