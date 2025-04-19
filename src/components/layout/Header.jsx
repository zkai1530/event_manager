import { useAuth } from "context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaPlus, FaRegHeart } from "react-icons/fa";
import { GrNotification } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";
import { getUserInfo } from "services/user/userService";

const Header = () => {
  const token = localStorage.getItem("token");
  const [avatar, setAvatar] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Hồ Chí Minh city");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userInfoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!avatar && token) {
      getUserInfo(token)
        .then((data) => setAvatar(data.avatarUrl))
        .catch((error) => console.error("getUserInfo", error));
    }
  }, [token]);
  console.log(avatar);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const dropdownItems = [
    { id: 1, label: "Manage my events", link: "/organizations/events/all" },
    { id: 2, label: "Settings", link: "/settings" },
    { id: 3, label: "Logout", link: "/logout" },
  ];

  return (
    <header className="border-b border-gray-200 py-3">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Search */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Logo */}
          <div className="flex w-fit cursor-pointer items-center">
            <h1 className="font-logo from-main to-emphasis bg-gradient-to-r bg-clip-text text-[22px] font-bold text-transparent md:text-[26px]">
              Eventify
            </h1>
          </div>

          {/* Search and Location Bar (Desktop) */}
          <div className="hidden flex-1 items-center space-x-2 md:flex md:max-w-[700px]">
            {/* Location Input */}
            <div className="relative w-1/2 md:w-[40%]">
              <input
                type="text"
                placeholder="Choose a location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="focus:ring-secondary w-full rounded-lg border border-gray-300 py-2 pr-3.5 pl-10 focus:ring-1 focus:outline-none"
              />
              <FaMapMarkerAlt className="text-main absolute top-1/2 left-3 -translate-y-1/2 transform" />
            </div>

            {/* Search Input */}
            <div className="relative w-1/2 md:w-[60%]">
              <input
                type="text"
                placeholder="Search events"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-secondary w-full rounded-lg border border-gray-300 py-2 pr-12 pl-4 focus:ring-1 focus:outline-none"
              />
              <button className="bg-main hover:bg-main-bold absolute inset-y-0 right-0 m-0.5 flex cursor-pointer items-center justify-center rounded-lg px-3 text-white">
                <FaSearch className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-fit items-center space-x-3 lg:space-x-5">
          {/* Create Event Button */}
          <button
            onClick={() => navigate("/manage/event/create")}
            className="bg-main hover:bg-main-bold flex cursor-pointer items-center space-x-2 rounded-full px-2 py-2 text-white lg:px-4"
          >
            <FaPlus />
            <span className="text-sm md:text-base">Tạo sự kiện</span>
          </button>

          {/* Likes Link */}
          <a href="#" className="hover:text-primary flex flex-col items-center">
            <FaRegHeart size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Yêu thích
            </span>
          </a>

          {/* Notifications Link */}
          <a href="#" className="hover:text-primary flex flex-col items-center">
            <GrNotification size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Thông báo
            </span>
          </a>

          {/* User Info */}
          <div
            className="relative flex cursor-pointer items-center space-x-2"
            onClick={toggleDropdown}
            ref={userInfoRef}
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-300">
              <img
                src={avatar}
                alt="User Avatar"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="text-textDark hidden lg:block">Tài khoản</span>

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

        {/* Search and Location Bar on small screens */}
        <div className="flex w-full flex-col gap-2 md:hidden">
          {/* Location Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Choose a location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="focus:ring-secondary w-full rounded-lg border border-gray-300 py-2 pr-3.5 pl-10 focus:ring-1 focus:outline-none"
            />
            <FaMapMarkerAlt className="text-main absolute top-1/2 left-3 -translate-y-1/2 transform" />
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-secondary w-full rounded-lg border border-gray-300 py-2 pr-12 pl-4 focus:ring-1 focus:outline-none"
            />
            <button className="bg-main hover:bg-main-bold absolute inset-y-0 right-0 m-0.5 flex cursor-pointer items-center justify-center rounded-lg px-3 text-white">
              <FaSearch className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
