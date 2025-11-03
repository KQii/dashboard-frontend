import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: AlertCircle,
    },
    {
      label: "Administration",
      href: "/administration",
      icon: Users,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold">
              ES
            </div>
            <h1 className="font-bold text-lg">Monitoring</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-700 text-xs text-gray-400 text-center">
        {!isCollapsed && <p>v1.0.0</p>}
      </div>
    </aside>
  );
}
