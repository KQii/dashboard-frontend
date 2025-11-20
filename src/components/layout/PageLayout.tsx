import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { useSidebar } from "../../contexts/SidebarContext";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  showExternalLinks?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  countdown?: number;
}

export function PageLayout({
  title,
  children,
  showExternalLinks = false,
  lastUpdated,
  onRefresh,
  isRefreshing,
  countdown,
}: PageLayoutProps) {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      {/* <DashboardHeader
        title={title}
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        countdown={countdown}
        showExternalLinks={showExternalLinks}
      /> */}

      <main className="p-8 transition-all duration-300">{children}</main>
    </div>
  );
}
