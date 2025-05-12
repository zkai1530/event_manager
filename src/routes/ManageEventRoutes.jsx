import ManageEventLayout from "layout/ManageEventLayout";
import CreateEvent from "pages/users/event_manager/CreateEvent";
import CreateSchedule from "pages/users/event_manager/CreateSchedule";
import { Routes, Route } from "react-router-dom";
import TicketManagement from "pages/users/event_manager/TicketManagement";
import EventDashboard from "pages/users/event_manager/EventDashboard";
import TicketSalesPage from "pages/users/event_manager/TicketSales";
import BankAccountSetup from "@/pages/users/event_manager/EventPublish";

const ManageEventRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManageEventLayout />}>
        <Route path="create" element={<CreateEvent />} />
        <Route path=":eventId/schedules" element={<CreateSchedule />} />
        <Route path=":eventId/tickets" element={<TicketManagement />} />
        <Route path=":eventId/promotions" element={<TicketManagement />} />
        <Route path=":eventId/details" element={<CreateEvent />} />
        <Route path=":eventId/publish" element={<BankAccountSetup />} />
        <Route path=":eventId/event-dashboard" element={<EventDashboard />} />
        <Route
          path=":eventId/schedule/:scheduleId"
          element={<TicketSalesPage />}
        />
      </Route>
    </Routes>
  );
};

export default ManageEventRoutes;
// ? /manage/event/
