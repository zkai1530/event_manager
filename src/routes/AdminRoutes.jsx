import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import DisbursementManagement from "@/pages/admin/DisbursementManagement";
import EventManagement from "@/pages/admin/EventManagement";
import ComplaintManagement from "@/pages/admin/ComplaintManagement";
import UserManagement from "@/pages/admin/UserManagement";
import AdminStatistics from "@/pages/admin/AdminStatistics";

const AdminRoutes = () => {
  // const { user } = useAuth();

  // if (!user || user.role !== "admin") {
  //   return <Navigate to="/user/dashboard" />;
  // }

  const { role } = useAuth();

  if (role === null) return null; // Chờ role
  if (role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="disbursement" element={<DisbursementManagement />} />
        <Route path="event-management" element={<EventManagement />} />
        <Route path="complaint-management" element={<ComplaintManagement />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="statistics" element={<AdminStatistics />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
