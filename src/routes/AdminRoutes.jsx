import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoutes = () => {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/user/dashboard" />;
  }

  return (
    <Routes>  
      {/* <Route path="/dashboard" element={<AdminDashboard />} /> */}
    </Routes>
  );
};

export default AdminRoutes;
