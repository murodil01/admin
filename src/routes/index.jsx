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

import Tasks from "../pages/tasks";
import Sales from "../pages/sales";
import Employees from "../pages/employees";
import Messenger from "../pages/messenger";
import Departments from "../pages/departments";
import Calendar from "../pages/calendar";
import Leads from "../pages/leads";
import Activity from "../pages/employees/activity";
import Profile from "../pages/employees/profile";
import TaskDetails from "../pages/tasks/TaskDetails";

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
          { path: "tasks", element: <Tasks />,},
          { path: "tasks/:id", element: <TaskDetails />,},
          { path: "sales", element: <Sales /> },
          { path: "employees", element: <Employees /> },
          { path: "messenger", element: <Messenger /> },
          { path: "departments", element: <Departments /> },
          { path: "calendar", element: <Calendar /> },
          { path: "leads", element: <Leads /> },
          { path: "activity", element: <Activity /> },
          { path: "profile/:id", element: <Profile /> },
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
