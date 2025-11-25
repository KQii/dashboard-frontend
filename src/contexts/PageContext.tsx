import { createContext, useContext, useState, ReactNode } from "react";

interface PageContextType {
  pageTitle: string;
  lastUpdated: Date | null;
  countdown: number;
  isRefreshing: boolean;
  setPageInfo: (info: {
    pageTitle: string;
    lastUpdated?: Date | null;
    countdown?: number;
    isRefreshing?: boolean;
    showExternalLinks?: boolean;
  }) => void;
  onRefresh?: () => void;
  setOnRefresh: (fn: (() => void) | undefined) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState(
    "Elasticsearch Cluster Monitoring System"
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [onRefresh, setOnRefresh] = useState<(() => void) | undefined>(
    undefined
  );

  const setPageInfo = (info: {
    pageTitle: string;
    lastUpdated?: Date | null;
    countdown?: number;
    isRefreshing?: boolean;
    showExternalLinks?: boolean;
  }) => {
    setPageTitle(info.pageTitle);
    if (info.lastUpdated !== undefined) setLastUpdated(info.lastUpdated);
    if (info.countdown !== undefined) setCountdown(info.countdown);
    if (info.isRefreshing !== undefined) setIsRefreshing(info.isRefreshing);
  };

  return (
    <PageContext.Provider
      value={{
        pageTitle,
        lastUpdated,
        countdown,
        isRefreshing,
        setPageInfo,
        onRefresh,
        setOnRefresh,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePageContext must be used within PageProvider");
  }
  return context;
}
