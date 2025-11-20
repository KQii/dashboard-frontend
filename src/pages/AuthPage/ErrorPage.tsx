import { useNavigate, useLocation } from "react-router-dom";
import { Activity, AlertCircle } from "lucide-react";

export function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const message =
    location.state?.message ||
    "This link has expired or is invalid. Please contact an administrator for a new one.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Invalid Link
          </h1>
          <p className="text-center text-gray-600 mb-8">{message}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Go to Login
            </button>

            <p className="text-center text-sm text-gray-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-600">
          <Activity className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-medium">Elasticsearch Monitoring</span>
        </div>
      </div>
    </div>
  );
}
