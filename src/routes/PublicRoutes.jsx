import AccountSettings from "@/pages/users/browser_event/AccountManagement";
import BankAccountForm from "@/pages/users/event_manager/EventPublish";
import UserLayout from "layout/UserLayout";
import Callback from "pages/auth/Callback";
import Login from "pages/auth/Login";
import EventDetails from "pages/users/browser_event/EventDetails";
import CheckIn from "pages/users/browser_event/Home";
import Home from "pages/users/browser_event/Home";
import SearchEvent from "pages/users/browser_event/SearchEvent";
import { Routes, Route } from "react-router-dom";

const PublicRoutes = () => {
  return (
    <Routes>
      {/* route don't have layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />

      {/* route have layout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<CheckIn />} />
        <Route path="/search" element={<SearchEvent />} />
        <Route path="/details/:slug" element={<EventDetails />} />
        <Route path="/test" element={<BankAccountForm />} />
        <Route path="/test1" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
