import EventStepper from "components/layout/EventStepper";
import OrganizerHeader from "components/layout/OrganizerHeader";
import OrganizerSidebar from "components/layout/OrganizerSidebar";
import { Outlet } from "react-router-dom";

const ManageEventLayout = () => {
  return (
    <div>
      <div className="fixed top-0 right-0 left-0 z-100">
        <OrganizerHeader />
      </div>
      <div className="flex pt-[4.063rem]">
        <div className="fixed left-0 h-screen w-13 z-[100]">
          <OrganizerSidebar />
        </div>
        <div className="z-[50] container mx-auto ml-13 flex-1">
          <main>
            <EventStepper />
            <div className="ml-[25%] w-3/4 overflow-y-auto py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManageEventLayout;
