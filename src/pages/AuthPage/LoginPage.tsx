import { useAuth } from "../../contexts/AuthContext";
import { Activity } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Elasticsearch Monitoring
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access your monitoring dashboard
          </p>

          <button
            onClick={login}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Sign in with Admin Service
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Authentication is managed by your Admin Service
          </p>
        </div>
      </div>
    </div>
  );
}
