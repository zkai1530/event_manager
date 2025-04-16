import ManageEventLayout from "layout/ManageEventLayout";
import CreateEvent from "pages/users/event_manager/CreateEvent";
import CreateSchedule from "pages/users/event_manager/CreateSchedule";
import CreateTicket from "pages/users/event_manager/CreateTicket";
import { Routes, Route } from "react-router-dom";

const ManageEventRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManageEventLayout />}>
        <Route path="create" element={<CreateEvent />} />
        <Route path=":eventId/schedules" element={<CreateSchedule />} />
        <Route path=":eventId/tickets" element={<CreateTicket />} />
        <Route path=":eventId/promotions" element={<CreateTicket />} />
        <Route path=":eventId/details" element={<CreateEvent />} />
      </Route>
    </Routes>
  );
};

export default ManageEventRoutes;
