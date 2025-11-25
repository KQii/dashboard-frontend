export interface Recommendation {
  id: string;
  title: string;
  description: string;
  action_steps: string;
  created_at: string;
  related_metrics?: string[];
  evidence?: string;
}

export interface AnalysisResponse {
  message: string;
  recommendations: Recommendation[];
  status: string;
}
