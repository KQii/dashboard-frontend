import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import getRouter from "./routes";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 25000, // Data fresh for 25s
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 2, // Retry failed requests 2 times
      refetchInterval: 30000, // Auto-refetch every 30s
    },
  },
});
const persistor = persistStore(store);
const environment = import.meta.env.NODE_ENV as
  | "development"
  | "testing"
  | "production";

createRoot(document.getElementById("root")!).render(
  <ReduxProvider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={getRouter("development")} />
        </AuthProvider>
      </QueryClientProvider>
    </PersistGate>
    <Toaster
      position="bottom-right"
      gutter={12}
      containerStyle={{ margin: "8px" }}
      toastOptions={{
        success: {
          duration: 3000,
        },
        error: {
          duration: 5000,
        },
        style: {
          fontSize: "16px",
          maxWidth: "500px",
          padding: "16px 24px",
          backgroundColor: "#fff",
          color: "#374151",
        },
      }}
    />
  </ReduxProvider>
);
