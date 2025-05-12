import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
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

// Menu items.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
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
      url: "/admin/calendar",
      icon: Calendar,
    },
    {
      title: "Quản lý sự kiện",
      url: "/admin/calendar",
      icon: Calendar,
    },
    {
      title: "Quản lý giải ngân",
      url: "/admin/disbursement",
      icon: Inbox,
    },
    {
      title: "Quản lý khiếu nại",
      url: "/admin/search",
      icon: Search,
    },
    {
      title: "Thống kê",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState(window.location.pathname);

  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <Sidebar variant="floating" collapsible="icon" className="bg-sidebar">
      <SidebarContent className="rounded-lg bg-white">
        <SidebarGroup className="">
          <SidebarGroupLabel className="">Application</SidebarGroupLabel>
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
