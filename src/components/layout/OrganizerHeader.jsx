import { useAuth } from "@/context/AuthContext";
import { getUserInfo } from "@/services/user/userService";
import { useEffect, useRef, useState } from "react";
import {FaPlus, FaRegHeart } from "react-icons/fa";
import { GrNotification } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";

const OrganizerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const userInfoRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (!avatar && token) {
      getUserInfo(token)
        .then((data) => setAvatar(data.avatarUrl))
        .catch((error) => console.error("getUserInfo", error));
    }
  }, [token]);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const dropdownItems = [
    { id: 1, label: "Khám phá sự kiện", link: "/" },
    { id: 2, label: "Tài khoản", link: "/settings" },
    { id: 3, label: "Đăng xuất", link: "#", onClick: () => logout() },
  ];

  return (
    <header className="border-b border-gray-100 bg-white py-3">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Search */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Logo */}
          <div
            className="flex w-fit cursor-pointer items-center"
            onClick={() => navigate("/organizations/events/all")}
          >
            <h1 className="font-logo from-main to-emphasis bg-gradient-to-r bg-clip-text text-[22px] font-bold text-transparent md:text-[26px]">
              Eventify
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-fit items-center space-x-3 lg:space-x-5">
          {/* Create Event Button */}
          <button
            className="bg-secondary1 hover:bg-emphasis flex cursor-pointer items-center space-x-2 rounded-full px-2 py-2 text-white lg:px-4"
            onClick={() => navigate("/manage/event/create")}
          >
            <FaPlus />
            <span className="text-sm md:text-base">Tạo sự kiện</span>
          </button>

          {/* Likes Link */}
          {/* <a href="#" className="hover:text-primary flex flex-col items-center">
            <FaRegHeart size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Likes
            </span>
          </a> */}

          {/* Notifications Link */}
          {/* <a href="#" className="hover:text-primary flex flex-col items-center">
            <GrNotification size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Notification
            </span>
          </a> */}

          {/* User Info */}
          <div
            className="relative flex cursor-pointer items-center space-x-2"
            onClick={toggleDropdown}
            ref={userInfoRef}
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-300">
              {avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white">K</span>
              )}
            </div>
            <span className="text-textDark hidden lg:block">Tài khoản</span>

            {dropdownOpen && (
              <div className="absolute top-full right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                <ul className="py-1">
                  {dropdownItems.map((item) => (
                    <li key={item.id}>
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className="block w-full cursor-pointer px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          to={item.link}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </Link>
                      )}
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
