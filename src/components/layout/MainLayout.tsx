import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { PageProvider, usePageContext } from "../../contexts/PageContext";

function MainLayoutContent() {
  const { pageTitle, lastUpdated, countdown, isRefreshing, onRefresh } =
    usePageContext();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top when route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen flex-col">
      <Header
        title="Elasticsearch Monitoring System"
        pageTitle={pageTitle}
        lastUpdated={lastUpdated}
        countdown={countdown}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

const MainLayout = () => {
  return (
    <PageProvider>
      <MainLayoutContent />
    </PageProvider>
  );
};

export default MainLayout;
