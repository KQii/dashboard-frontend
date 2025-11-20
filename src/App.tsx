import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Sidebar } from "./components/layout/Sidebar";
import Login from "./pages/AuthPage/LoginPage";
import { Callback } from "./pages/AuthPage/Callback";
import SetupPassword from "./pages/AuthPage/SetupPasswordPage";
import { ErrorPage } from "./pages/AuthPage/ErrorPage";
import DashboardPage from "./pages/DashboardPage";
import AlertsPage from "./pages/AlertsPage";
import SelfHealingPage from "./pages/SelfHealingPage";
import AdministrationPage from "./pages/AdministrationPage";
import ProfilePage from "./pages/ProfilePage";
import { SidebarProvider } from "./contexts/SidebarContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/setup-password" element={<SetupPassword />} />
            <Route path="/error" element={<ErrorPage />} />
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
              path="/self-healing"
              element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <SelfHealingPage />
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
