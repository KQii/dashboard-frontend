import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout";
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";

const developmentRoutes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [...MainRoutes, ...AuthRoutes],
  },
]);

const testingRoutes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [...MainRoutes, ...AuthRoutes],
  },
]);

const productionRoutes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [...MainRoutes, ...AuthRoutes],
  },
]);

const getRouter = (environment: "development" | "testing" | "production") => {
  switch (environment) {
    case "development":
      return developmentRoutes;
    case "testing":
      return testingRoutes;
    case "production":
      return productionRoutes;
  }
};

export default getRouter;
