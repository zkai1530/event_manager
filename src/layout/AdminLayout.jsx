import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full px-5 bg-sidebar">
        <div className="sticky top-0 z-10 bg-sidebar">
          <SidebarTrigger
            className="cursor-pointer"
            onClick={() => {}}
          />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
