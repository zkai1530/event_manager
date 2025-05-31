import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { introspect } from "@/services/user/userService";

const PrivateRoutes = () => {
  const { user, setUser, setRole } = useAuth();
  const [isValid, setIsValid] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }
      try {
        const response = await introspect(token);
        setIsValid(response.data.valid);
        if (response.data.valid) {
          setUser({ token }); // Set user nếu valid
          setRole(response.data.role); // Set role
        } else {
          localStorage.removeItem("token");
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Introspect failed", error);
        if (error.response?.data?.message === "Unauthenticated") {
          setIsValid(false);
          localStorage.removeItem("token");
          setUser(null);
          setRole(null);
        } else {
          setIsValid(true); // Giữ valid nếu lỗi khác
        }
      }
    };

    checkToken();
  }, [token, setUser, setRole]);

  if (isValid === null) return null; // Chờ kiểm tra
  return isValid && user ? <Outlet /> : <Navigate to="/login" replace />;
  // return token ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
