import { Suspense } from "react";
import AuthPage from "../pages/AuthPage";
import ErrorPage from "../pages/ErrorPage";
import LoginPage from "../pages/AuthPage/LoginPage";
import SetupPasswordPage from "../pages/AuthPage/SetupPasswordPage";
import { Callback } from "../pages/AuthPage/Callback";

const AuthRoutes = [
  {
    path: "/auth",
    element: (
      <Suspense>
        <AuthPage />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: (
      <Suspense>
        <LoginPage />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/setup-password",
    element: (
      <Suspense>
        <SetupPasswordPage />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/callback",
    element: (
      <Suspense>
        <Callback />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
];

export default AuthRoutes;
