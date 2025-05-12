import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import DisbursementManagement from "@/pages/admin/DisbursementManagement";

const AdminRoutes = () => {
  // const { user } = useAuth();

  // if (!user || user.role !== "admin") {
  //   return <Navigate to="/user/dashboard" />;
  // }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="disbursement" element={<DisbursementManagement />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
