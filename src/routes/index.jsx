// import { createBrowserRouter } from "react-router-dom";
// import Login from "../pages/login";
// import Home from "../pages/home";
// import VerifyPassword from "../pages/verify-password";
// import PrivateRoute from "../components/private-route";
// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <PrivateRoute />,
//     children: [
//       {
//         path: "/",
//         element: <Home />,
//       },
//     ],
//   },
//   {
//     path: "/login",
//     element: <Login />,
//   },
//   {
//     path: "/verify-password",
//     element: <VerifyPassword />,
//   },
// ]);

import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/login";
import Home from "../pages/home";
import VerifyPassword from "../pages/verify-password";
import PrivateRoute from "../components/private-route";
import AppLayout from "../components/home";

import Projects from "../pages/projects";
import Vacations from "../pages/vacations";
import Employees from "../pages/employees";
import Messenger from "../pages/messenger";
import InfoPortal from "../pages/info-portal";
import Activity from "../pages/employees/activity";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />, 
        children: [
          { path: "", element: <Home /> },
          { path: "projects", element: <Projects /> },
          { path: "vacations", element: <Vacations /> },
          { path: "employees", element: <Employees /> },
          { path: "messenger", element: <Messenger /> },
          { path: "info-portal", element: <InfoPortal /> },
          {path: "activity", element: <Activity />}, 
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify-password",
    element: <VerifyPassword />,
  },
]);
