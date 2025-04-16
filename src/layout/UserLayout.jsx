import Header from "components/layout/Header";
import OrganizerHeader from "components/layout/OrganizerHeader";
import OrganizerSidebar from "components/layout/OrganizerSidebar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default UserLayout;
