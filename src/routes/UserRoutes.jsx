import AccountInfo from "@/pages/users/browser_event/AccountManagement";
import PaymentPage from "@/pages/users/browser_event/PaymentPage";
import SuccessOrder from "@/pages/users/browser_event/SuccessOrder";
import UserLayout from "layout/UserLayout";
import FavoriteEvent from "pages/users/browser_event/FavoriteEvent";
import Home from "pages/users/browser_event/Home";
import MyTickets from "pages/users/browser_event/MyTIckets";
import { Routes, Route } from "react-router-dom";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route path="my-tickets/:status/:timeFilter" element={<MyTickets />} />
        <Route path="favorite-event" element={<FavoriteEvent />} />
        <Route path="account" element={<AccountInfo />} />
        <Route path="success-order" element={<SuccessOrder />} />
        <Route path=":slug/payment/:orderId" element={<PaymentPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
// /user