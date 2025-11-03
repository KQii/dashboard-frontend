import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { PageLayout } from "../components/PageLayout";
import { User } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <PageLayout title="Edit Profile">
      <div className="max-w-2xl">
        <div className="bg-white border rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <div className="px-4 py-2 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700">Active</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t">
              <button
                type="button"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>

            {isSaved && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Profile updated successfully!
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 bg-white border rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Account Information
          </h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">
                Account Type
              </dt>
              <dd className="text-sm text-gray-900 font-semibold">Premium</dd>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <dt className="text-sm font-medium text-gray-600">
                Member Since
              </dt>
              <dd className="text-sm text-gray-900">January 2024</dd>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <dt className="text-sm font-medium text-gray-600">
                Last Updated
              </dt>
              <dd className="text-sm text-gray-900">Today</dd>
            </div>
          </dl>
        </div>
      </div>
    </PageLayout>
  );
}
