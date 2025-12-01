import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { RoleBadge } from "../ui/RoleBadge";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <User className="w-4 h-4" />
        <span>{user?.preferred_username || user?.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="mb-2 text-xs text-gray-500">{user?.email}</p>
            {user?.role && <RoleBadge role={user?.role} />}
          </div>

          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          <div className="border-t">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
