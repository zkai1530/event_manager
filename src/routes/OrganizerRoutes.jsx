import OrganizerLayout from "layout/OrganizerLayout";
import CreateEvent from "pages/users/event_manager/CreateEvent";
import { Routes, Route } from "react-router-dom";

const OrganizerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OrganizerLayout />}>
        <Route path="events" element={<CreateEvent />} />
      </Route>
    </Routes>
  );
};

export default OrganizerRoutes;
