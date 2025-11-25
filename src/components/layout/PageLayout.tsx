import { ReactNode, useEffect } from "react";
import { usePageContext } from "../../contexts/PageContext";

interface PageLayoutProps {
  pageTitle: string;
  children: ReactNode;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  countdown?: number;
}

export function PageLayout({
  pageTitle,
  children,
  lastUpdated,
  onRefresh,
  isRefreshing,
  countdown,
}: PageLayoutProps) {
  const { setPageInfo, setOnRefresh } = usePageContext();

  // Update context whenever props change
  useEffect(() => {
    setPageInfo({
      pageTitle,
      lastUpdated,
      countdown,
      isRefreshing: isRefreshing || false,
    });
  }, [pageTitle, lastUpdated, countdown, isRefreshing, setPageInfo]);

  // Update onRefresh callback
  useEffect(() => {
    setOnRefresh(onRefresh ? () => onRefresh : undefined);
  }, [onRefresh, setOnRefresh]);

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <main className="p-4 transition-all duration-300">{children}</main>
    </div>
  );
}
