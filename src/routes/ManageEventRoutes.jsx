import ManageEventLayout from "layout/ManageEventLayout";
import CreateEvent from "pages/users/event_manager/CreateEvent";
import CreateSchedule from "pages/users/event_manager/CreateSchedule";
import { Routes, Route } from "react-router-dom";
import TicketManagement from "pages/users/event_manager/TicketManagement";

const ManageEventRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManageEventLayout />}>
        <Route path="create" element={<CreateEvent />} />
        <Route path=":eventId/schedules" element={<CreateSchedule />} />
        <Route path=":eventId/tickets" element={<TicketManagement />} />
        <Route path=":eventId/promotions" element={<TicketManagement />} />
        <Route path=":eventId/details" element={<CreateEvent />} />
      </Route>
    </Routes>
  );
};

export default ManageEventRoutes;
// ? /manage/event/
