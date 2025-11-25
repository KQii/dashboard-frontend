import { useState, useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { RecommendationCard } from "../components/container/RecommendationCard";
import useTitle from "../hooks/useTitle";
import {
  useRecommendations,
  useCreateRecommendation,
} from "../features/recommendations/useRecommendations";

export default function RecommendPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  const {
    recommendations = [],
    isLoadingRecommendations,
    refetchRecommendations,
    recommendsUpdatedAt,
  } = useRecommendations();
  const { isCreating, createRecommendation } = useCreateRecommendation();
  const isFetchingAny = useIsFetching();
  const isRefreshing = isFetchingAny > 0;

  useTitle("Recommendation");

  useEffect(() => {
    if (recommendsUpdatedAt) {
      setLastUpdated(new Date(recommendsUpdatedAt));
      setCountdown(30); // Reset countdown after fetch
    }
  }, [recommendsUpdatedAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <PageLayout
      pageTitle="Recommendation"
      lastUpdated={lastUpdated}
      onRefresh={() => refetchRecommendations()}
      isRefreshing={isRefreshing}
      countdown={countdown}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Recommendations
                </h1>
                <p className="text-gray-600">
                  AI-powered insights and actionable recommendations for
                  Elasticsearch Cluster Monitoring System
                </p>
              </div>
              <button
                onClick={() => createRecommendation()}
                disabled={isCreating}
                className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed shadow-md"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading recommendations...</p>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Recommendations Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Run an analysis to generate AI-powered recommendations
              </p>
              <button
                onClick={() => createRecommendation()}
                disabled={isCreating}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Run Your First Analysis
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
