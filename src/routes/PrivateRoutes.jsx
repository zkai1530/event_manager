import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoutes = () => {
  const token = localStorage.getItem("token");

  console.log(token)
  return token ? <Outlet /> : <Navigate to="/" />;
  // return user ? <Outlet /> : <Outlet />;
};

export default PrivateRoutes;
