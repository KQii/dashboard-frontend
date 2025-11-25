import {
  Recommendation,
  AnalysisResponse,
} from "../types/recommendation.types";

const recommendBackendUrl = import.meta.env.VITE_RECOMMEND_SERVICE_URL;

export async function fetchRecommendations(): Promise<Recommendation[]> {
  try {
    const response = await fetch(`${recommendBackendUrl}/recommendations`);

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
}

export async function triggerAnalysis(): Promise<AnalysisResponse> {
  try {
    const response = await fetch(`${recommendBackendUrl}/trigger-analysis`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error toggling self-healing:", error);
    throw error;
  }
}
