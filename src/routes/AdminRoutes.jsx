import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import DisbursementManagement from "@/pages/admin/DisbursementManagement";
import EventManagement from "@/pages/admin/EventManagement";
import ComplaintManagement from "@/pages/admin/ComplaintManagement";
import UserManagement from "@/pages/admin/UserManagement";

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
        <Route path="event-management" element={<EventManagement />} />
        <Route path="complaint-management" element={<ComplaintManagement />} />
        <Route path="user-management" element={<UserManagement />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
