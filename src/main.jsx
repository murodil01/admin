import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes";
import "@ant-design/v5-patch-for-react-19";
import "aos/dist/aos.css";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { ConfigProvider } from "antd";

const root = createRoot(document.getElementById("root"));

root.render(
  <>
    <HelmetProvider>
      <ConfigProvider
        theme={{
          token: {
            // Antd global theme settings (optional)
            colorPrimary: '#1677ff',
            borderRadius: 6,
          },
        }}
      >
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "14px",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "green",
                  secondary: "white",
                },
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "red",
                  secondary: "white",
                },
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
              loading: {
                style: {
                  background: "#3b82f6",
                  color: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </ConfigProvider>
    </HelmetProvider>
  </>
);