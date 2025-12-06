import { useState, useMemo } from "react";
import { useLoaderData } from "react-router-dom";
import { Activity, Eye, EyeOff, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { setupPassword } from "../../services/apiAuth";
import { User } from "../../types/user.types";

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
  optional?: boolean;
}

const passwordRules: PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Includes uppercase, lowercase, number",
    test: (pwd) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd),
  },
  {
    label: "(Optional) Includes special character",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    optional: true,
  },
];

export default function SetupPasswordPage() {
  const { user, token } = useLoaderData() as { user: User; token: string };

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate password rules
  const passwordValidation = useMemo(() => {
    return passwordRules.map((rule) => ({
      ...rule,
      isValid: rule.test(password),
    }));
  }, [password]);

  // Check if all required rules are met
  const isPasswordValid = useMemo(() => {
    return passwordValidation
      .filter((rule) => !rule.optional)
      .every((rule) => rule.isValid);
  }, [passwordValidation]);

  // Check if passwords match
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  // Check if form is valid
  const isFormValid =
    isPasswordValid &&
    passwordsMatch &&
    password !== "" &&
    confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please ensure all requirements are met");
      return;
    }

    if (!token) {
      toast.error("Invalid activation link");
      return;
    }

    setIsSubmitting(true);

    try {
      await setupPassword(token, user.email, password, confirmPassword);

      toast.success("Password set successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      toast.error("Failed to set password. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Setup Your Password
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Your account has been activated. Please set a secure password to
            continue.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Password Rules */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Password requirements:
              </p>
              {passwordValidation.map((rule, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {password === "" ? (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    ) : rule.isValid ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      password === ""
                        ? "text-gray-600"
                        : rule.isValid
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? "Setting up..." : "Set Password & Continue"}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have a password?{" "}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
