import { Suspense } from "react";
import AuthPage from "../pages/AuthPage";
import ErrorPage from "../pages/ErrorPage";
import AuthErrorPage from "../pages/AuthPage/AuthErrorPage";
import LoginPage from "../pages/AuthPage/LoginPage";
import SetupPasswordPage from "../pages/AuthPage/SetupPasswordPage";
import { getUserBySetupToken } from "../services/apiAuth";

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
    errorElement: <AuthErrorPage />,
    loader: async ({ request }) => {
      const url = new URL(request.url);
      const token = url.searchParams.get("token");

      if (!token) {
        throw new Response(null, {
          status: 400,
          statusText:
            "No setup token provided. Please use the link from your email.",
        });
      }

      try {
        const user = await getUserBySetupToken(token);
        return { user, token };
      } catch (error: any) {
        throw new Response(null, {
          status: 401,
          statusText:
            "This token has expired or is invalid. Please contact an administrator for a new one.",
        });
      }
    },
  },
];

export default AuthRoutes;
