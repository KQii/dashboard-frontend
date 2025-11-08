import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Sidebar } from "./components/layout/Sidebar";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { DashboardPage } from "./pages/Dashboard";
import { AlertsPage } from "./pages/AlertsPage";
import { AdministrationPage } from "./pages/AdministrationPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SidebarProvider } from "./contexts/SidebarContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <DashboardPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <AlertsPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <AdministrationPage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <ProfilePage />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
