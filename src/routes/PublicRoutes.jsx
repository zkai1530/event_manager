import UserLayout from "layout/UserLayout";
import Callback from "pages/auth/Callback";
import Login from "pages/auth/Login";
import Home from "pages/users/browser_event/Home";
import { Routes, Route } from "react-router-dom";

const PublicRoutes = () => {
  return (
    <Routes>
      {/* route don't have layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />

      {/* route have layout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
