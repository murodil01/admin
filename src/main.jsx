import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "@ant-design/v5-patch-for-react-19";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  </StrictMode>
);
