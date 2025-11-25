import { useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Mail,
  User,
  Shield,
  Clock,
  CheckCircle2,
  Copy,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  SquareUser,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PageLayout } from "../components/layout/PageLayout";
import { RoleBadge } from "../components/ui/RoleBadge";
import { Modal } from "../components/common/Modal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useUpdatePassword } from "../features/auth/useAuth";
import useTitle from "../hooks/useTitle";

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

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { updatePassword, isUpdatingPassword } = useUpdatePassword();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useTitle("Profile");

  const displayName = user?.preferred_username || "User";

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const passwordValidation = passwordRules.map((rule) => ({
    ...rule,
    isValid: rule.test(newPassword),
  }));

  const isPasswordValid = passwordValidation
    .filter((rule) => !rule.optional)
    .every((rule) => rule.isValid);

  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  const canChangePassword =
    currentPassword !== "" &&
    isPasswordValid &&
    passwordsMatch &&
    newPassword !== "";

  const handlePasswordChangeClick = () => {
    if (canChangePassword) {
      setShowPasswordModal(false);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPasswordChange = () => {
    updatePassword(
      { passwordCurrent: currentPassword, password: newPassword },
      {
        onSuccess: () => {
          setShowConfirmModal(false);
          setShowPasswordModal(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");

          // Logout after successful password change
          setTimeout(() => {
            toast.success("Redirecting to login...");
            logout();
          }, 1500);
        },
      }
    );
  };

  return (
    <PageLayout
      pageTitle="User Profile"
      lastUpdated={null}
      onRefresh={undefined}
      isRefreshing={false}
      countdown={0}
    >
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white border-b px-8 py-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  @{user?.preferred_username}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <RoleBadge
                    role={(user?.role?.name || "admin") as "admin" | "operator"}
                  />
                  {user?.email_verified && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
            {/* Left Column - Account Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-600" />
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-2 p-6 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <SquareUser className="w-4 h-4 text-cyan-600" />
                      Username
                    </label>
                    <p className="text-gray-900">{user?.preferred_username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-600" />
                      Email Address
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-600" />
                    Account Details
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">
                        User ID
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-mono text-sm truncate">
                          {user?.sub}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(user?.sub || "", "sub")
                          }
                          className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-all flex-shrink-0"
                          title="Copy to clipboard"
                        >
                          {copiedField === "sub" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Role
                      </label>
                      <RoleBadge
                        role={
                          (user?.role?.name || "admin") as "admin" | "operator"
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-600" />
                        Created At
                      </label>
                      <p className="text-gray-900 text-sm">
                        {user?.created_at
                          ? format(new Date(user.created_at), "PPpp")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Last Updated
                      </label>
                      <p className="text-gray-900 text-sm">
                        {user?.updated_at
                          ? format(new Date(user.updated_at), "PPpp")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Security */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-600" />
                    Security
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-3">
                      Password
                    </label>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                  <div className="pt-4 border-t">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Email Status
                    </label>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        user?.email_verified
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-gray-50 text-gray-800 border border-gray-200"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {user?.email_verified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Profile Information
                </h3>
                <p className="text-xs text-blue-800">
                  Most profile information is managed by your organization's
                  authentication system. Contact your administrator to change
                  email or username.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
          title="Change Password"
          size="md"
        >
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none ${
                  confirmPassword && !passwordsMatch
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Confirm new password"
              />
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
                    {newPassword === "" ? (
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
                      newPassword === ""
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

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChangeClick}
                disabled={!canChangePassword}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </Modal>

        {/* Confirm Password Change Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          title="Confirm Password Change"
          variant="warning"
          resourceName="your password"
          onConfirm={handleConfirmPasswordChange}
          onCloseModal={() => setShowConfirmModal(false)}
          disabled={isUpdatingPassword}
          message="Are you sure you want to change your password? You will need to use the new password to login next time. You will be logged out automatically."
          confirmText="Change Password"
        />
      </div>
    </PageLayout>
  );
}
