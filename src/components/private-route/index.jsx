import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  let token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to={"/login"} replace />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default PrivateRoute;