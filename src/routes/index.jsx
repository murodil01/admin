import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/login";
import Home from "../pages/home";
import VerifyPassword from "../pages/verify-password";
import PrivateRoute from "../components/private-route";
import AppLayout from "../components/home";

import Tasks from "../pages/tasks/Tasks";
import Employees from "../pages/employees/InnerCircle";
import Messenger from "../pages/messenger";
import Departments from "../pages/departments";
import Calendar from "../pages/calendar";
import Leads from "../pages/leads";
import Activity from "../pages/employees/activity";
import Profile from "../pages/employees/profile";
import Archive from "../pages/archive";
import Reports from "../pages/reports";
import Library from "../pages/library";
import CategoryDetailsPage from "../pages/library/CategoryDetailsPage";
import Settings from "../pages/settings";
import MainProfile from "../pages/main-profile";
import TaskDetails from "../pages/tasks/TaskDetails";
import Notification from "../pages/notification";
import Customers from "../pages/customers";
import CategoryCard from "../components/m-library/CategoryCard";

import LeadSide from "../components/lead-parts/leads-side";
import LeadsRight from "../components/lead-parts/leads-right";

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
          { path: "tasks", element: <Tasks />, },
          { path: "tasks/:projectId", element: <TaskDetails />, },

          { path: "customers", element: <Customers /> },
          { path: "employees", element: <Employees /> },
          { path: "messenger", element: <Messenger /> },
          { path: "departments", element: <Departments /> },
          { path: "calendar", element: <Calendar /> },
          { path: "leads", element: <Leads /> },
          { path: "leads-side", element: <LeadSide /> }, // Assuming you want to handle specific lead details
          { path: "leads-right/:boardId", element: <LeadsRight /> },
          { path: "reports", element: <Reports /> },
          { path: "library", element: <Library /> },
          { path: "library/id", element: <CategoryDetailsPage /> },
          { path: "category/:id", element: <CategoryDetailsPage /> },
          { path: "library/folders/:id", element: <CategoryCard /> },


          { path: "archive", element: <Archive /> },
          { path: "activity", element: <Activity /> },
          { path: "profile/:id", element: <Profile /> },
          { path: "settings", element: <Settings /> },
          { path: "main-profile", element: <MainProfile /> },
          { path: "notification", element: <Notification /> },
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
