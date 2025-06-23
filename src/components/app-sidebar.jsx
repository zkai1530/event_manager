import {
  BanknoteArrowDown,
  Calendar,
  ChartNoAxesCombined,
  Home,
  MessageCircleWarning,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { NavUser } from "./nav-user";
import { useAuth } from "@/context/AuthContext";

// Menu items.
const data = {
  user: {
    name: "Ly Khanh",
    email: "lykhanh2303@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  items: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Quản lý người dùng",
      url: "/admin/user-management",
      icon: Users,
    },
    {
      title: "Quản lý sự kiện",
      url: "/admin/event-management",
      icon: Calendar,
    },
    {
      title: "Quản lý giải ngân",
      url: "/admin/disbursement",
      icon: BanknoteArrowDown,
    },
    {
      title: "Quản lý khiếu nại",
      url: "/admin/complaint-management",
      icon: MessageCircleWarning,
    },
    // {
    //   title: "Thống kê",
    //   url: "/admin/statistics",
    //   icon: ChartNoAxesCombined,
    // },
  ],
};

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState(window.location.pathname);
  const { logout } = useAuth();

  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <Sidebar variant="floating" collapsible="icon" className="bg-white">
      <SidebarContent className="rounded-lg bg-white">
        <SidebarGroup className="">
          <SidebarGroupLabel className="">Event Management</SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu className="">
              {data.items.map((item) => (
                <SidebarMenuItem className="" key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`${
                      activeItem === item.url
                        ? "bg-main text-white"
                        : "text-gray-700"
                    } hover:bg-main rounded-md transition-colors duration-200 hover:text-white`}
                    asChild
                  >
                    <a href={item.url} onClick={() => setActiveItem(item.url)}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="">
        <NavUser user={data.user} logout={logout} />
      </SidebarFooter>
    </Sidebar>
  );
}
