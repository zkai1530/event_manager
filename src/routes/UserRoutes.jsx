import UserLayout from "layout/UserLayout";
import Home from "pages/users/browser_event/Home";
import { Routes, Route } from "react-router-dom";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        {/* <Route path="about" element={<About />} /> */}
      </Route>
    </Routes>
  );
};

export default UserRoutes;
// /user