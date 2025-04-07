import { MdMenuOpen } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaProductHunt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { MdOutlineDashboard } from "react-icons/md";
import { useState } from "react";

const menuItems = [
  {
    icons: <IoHomeOutline size={25} />,
    label: "Home",
  },
  {
    icons: <FaProductHunt size={25} />,
    label: "Events",
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
  return (
    <nav className="flex h-screen flex-col bg-secondary p-2 text-white shadow-md duration-500">
      <ul className="flex-1">
        {menuItems.map((item, index) => {
          return (
            <li
              key={index}
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
      {/* footer */}
      {/* <div className="flex items-center gap-2 px-3 py-2">
        <div>
          <FaUserCircle size={30} />
        </div>
        <div
          className={`leading-5 ${!open && "w-0 translate-x-24"} overflow-hidden duration-500`}
        >
          <p>Saheb</p>
          <span className="text-xs">saheb@gmail.com</span>
        </div>
      </div> */}
    </nav>
  );
}

export default OrganizerSidebar;
