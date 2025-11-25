import {
  CheckCircle2,
  TrendingUp,
  Calendar,
  BarChart3,
  Ratio,
} from "lucide-react";
import type { Recommendation } from "../../types/recommendation.types";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">
            {recommendation.title}
          </h3>
          <div className="ml-4 flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">
          {recommendation.description}
        </p>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
            Action Steps
          </h4>
          <ol className="space-y-2">
            {recommendation.action_steps.split("\n").map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mr-3 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="mt-1 text-gray-700 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {recommendation.related_metrics &&
          recommendation.related_metrics.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                Related Metrics
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendation.related_metrics.map((metric, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}

        {recommendation.evidence && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Ratio className="w-4 h-4 mr-2 text-blue-600" />
              Evidence
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.evidence.split(",").map((metric, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-[6px] rounded-xl text-[11px] font-medium tracking-wide bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  {metric.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {new Date(recommendation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
