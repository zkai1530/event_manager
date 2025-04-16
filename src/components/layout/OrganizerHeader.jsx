import { useRef, useState } from "react";
import {FaPlus, FaRegHeart } from "react-icons/fa";
import { GrNotification } from "react-icons/gr";
import { Link } from "react-router-dom";

const OrganizerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userInfoRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const dropdownItems = [
    { id: 1, label: "Manage my events", link: "/organizations/events" },
    { id: 2, label: "Settings", link: "/settings" },
    { id: 3, label: "Logout", link: "/logout" },
  ];

  return (
    <header className="border-b border-gray-100 py-3 bg-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Search */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Logo */}
          <div className="flex w-fit items-center cursor-pointer">
            <h1 className="font-logo from-main to-emphasis bg-gradient-to-r bg-clip-text text-[22px] font-bold text-transparent md:text-[26px]">
              Eventify
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-fit items-center space-x-3 lg:space-x-5">
          {/* Create Event Button */}
          <button className="bg-secondary hover:bg-emphasis flex cursor-pointer items-center space-x-2 rounded-full px-2 py-2 text-white lg:px-4">
            <FaPlus />
            <span className="text-sm md:text-base">Create Event</span>
          </button>

          {/* Likes Link */}
          <a href="#" className="hover:text-primary flex flex-col items-center">
            <FaRegHeart size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Likes
            </span>
          </a>

          {/* Notifications Link */}
          <a href="#" className="hover:text-primary flex flex-col items-center">
            <GrNotification size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Notification
            </span>
          </a>

          {/* User Info */}
          <div
            className="relative flex cursor-pointer items-center space-x-2"
            onClick={toggleDropdown}
            ref={userInfoRef}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
              <span className="text-white">K</span>
            </div>
            <span className="text-textDark hidden lg:block">zkai@lgk.com</span>

            {dropdownOpen && (
              <div className="absolute top-full right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                <ul className="py-1">
                  {dropdownItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.link}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default OrganizerHeader;
