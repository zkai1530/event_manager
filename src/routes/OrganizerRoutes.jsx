import OrganizerLayout from "layout/OrganizerLayout";
import ListEvents from "pages/users/event_manager/ListEvents";
import { Routes, Route } from "react-router-dom";

const OrganizerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OrganizerLayout />}>
        <Route path="events/:status" element={<ListEvents />} />
      </Route>
    </Routes>
  );
};

export default OrganizerRoutes;
// ? /organizations