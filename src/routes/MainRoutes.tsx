import { Suspense } from "react";
import AuthProtector from "../components/container/AuthProtector";
import MainLayout from "../components/layout/MainLayout";
import ErrorPage from "../pages/ErrorPage";
import DashboardPage from "../pages/DashboardPage";
import AlertsPage from "../pages/AlertsPage";
import SelfHealingPage from "../pages/SelfHealingPage";
import AdministrationPage from "../pages/AdministrationPage";
import ProfilePage from "../pages/ProfilePage";

const MainRoutes = [
  {
    path: "/",
    element: (
      <Suspense>
        <AuthProtector redirect="/auth" allowedRoles={["admin", "operator"]}>
          <MainLayout />
        </AuthProtector>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "alerts",
        element: (
          <Suspense>
            <AlertsPage />
          </Suspense>
        ),
      },
      {
        path: "self-healing",
        element: (
          <Suspense>
            <SelfHealingPage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "administration",
        element: (
          <Suspense>
            <AuthProtector redirect="/auth" allowedRoles={["admin"]}>
              <AdministrationPage />
            </AuthProtector>
          </Suspense>
        ),
      },
    ],
  },
];

export default MainRoutes;
