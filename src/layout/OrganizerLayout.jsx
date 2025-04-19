import EventStepper from "components/layout/EventStepper";
import OrganizerHeader from "components/layout/OrganizerHeader";
import OrganizerSidebar from "components/layout/OrganizerSidebar";
import { Outlet } from "react-router-dom";

const OrganizerLayout = () => {
  return (
    <div>
      <div className="fixed top-0 right-0 left-0 z-50">
        <OrganizerHeader />
      </div>
      <div className="flex pt-[4.063rem]">
        <div className="fixed left-0 h-screen w-13">
          <OrganizerSidebar />
        </div>
        <div className=" ml-13 flex-1 py-8 px-15">
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayout;
