import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authService } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

export function Callback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Prevent duplicate processing in Strict Mode
    if (hasProcessed.current) return;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorParam = params.get("error");

      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        return;
      }

      hasProcessed.current = true;

      try {
        const redirectUri = `${window.location.origin}/callback`;
        const userData = await authService.handleCallback(
          code,
          redirectUri,
          dispatch
        );

        // Update AuthContext with user data
        setUser(userData);

        navigate("/");
      } catch (err) {
        console.error("Error handling callback:", err);
        setError("Failed to complete authentication. Please try again.");
        hasProcessed.current = false;
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
