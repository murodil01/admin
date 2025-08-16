import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes";
import "@ant-design/v5-patch-for-react-19";
import "aos/dist/aos.css";
import "./index.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: 'red',
              secondary: 'white',
            },
          },
        }}
      />
    </AuthProvider>
  </>
);