import { IoHomeOutline } from "react-icons/io5";
import { SiEventbrite } from "react-icons/si";
import { TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { MdOutlineDashboard } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    icons: <IoHomeOutline size={25} />,
    label: "Home",
  },
  {
    icons: <SiEventbrite size={25} />,
    label: "Events",
    path: "/organizations/events/all",
  },
  {
    icons: <MdOutlineDashboard size={25} />,
    label: "Dashboard",
  },
  {
    icons: <CiSettings size={25} />,
    label: "Setting",
  },
  {
    icons: <IoLogoBuffer size={25} />,
    label: "Log",
  },
  {
    icons: <TbReportSearch size={25} />,
    label: "Report",
  },
];

const OrganizerSidebar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-secondary flex h-screen flex-col p-2 text-white shadow-md duration-500">
      <ul className="flex-1">
        {menuItems.map((item, index) => {
          return (
            <li
              key={index}
              onClick={() => navigate(item.path)}
              className="group hover:bg-emphasis relative my-8 flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 duration-300"
            >
              <div>{item.icons}</div>
              <p className="absolute left-30 w-0 overflow-hidden rounded-md bg-white p-0 text-black shadow-md duration-100 group-hover:left-14 group-hover:w-fit group-hover:p-2">
                {item.label}
              </p>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default OrganizerSidebar;
