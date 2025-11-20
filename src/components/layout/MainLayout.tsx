import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SidebarV2";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header
        title="Elasticsearch Cluster Monitoring System"
        showExternalLinks={true}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
