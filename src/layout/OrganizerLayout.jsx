import OrganizerHeader from "components/layout/OrganizerHeader";
import OrganizerSidebar from "components/layout/OrganizerSidebar";
import { Outlet } from "react-router-dom";

const OrganizerLayout = () => {
  return (
    <div>
      <OrganizerHeader />
      <div className="flex">
        <div className="fixed left-0 h-screen w-13">
          <OrganizerSidebar />
        </div>
        <div className="container mx-auto ml-13 flex-1">
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayout;
