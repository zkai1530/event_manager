import Loading1 from "@/components/ui/Loading1";
import { useAuth } from "context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaPlus, FaRegHeart } from "react-icons/fa";
import { GrNotification } from "react-icons/gr";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  deleteNoti,
  getAllNotiByUser,
  readNoti,
} from "services/user/notificationService";
import { getUserInfo } from "services/user/userService";

const Header = () => {
  const token = localStorage.getItem("token");
  const { logout } = useAuth();
  const [avatar, setAvatar] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Hồ Chí Minh city");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userInfoRef = useRef(null);
  const navigate = useNavigate();
  const locations = useLocation();
  const [searchParams] = useSearchParams();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (locations.pathname === "/search") {
      const queryFromUrl = searchParams.get("q") || "";
      setSearchQuery(queryFromUrl);
    }
  }, [locations.pathname, searchParams]);

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
    { id: 1, label: "Sự kiện của tôi", link: "/organizations/events/all" },
    { id: 2, label: "Vé của tôi", link: "/user/my-tickets/all/upcoming" },
    { id: 3, label: "Tài khoản", link: "/user/account" },
    { id: 4, label: "Đăng xuất", link: "#", onClick: () => logout() },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery || "")}`);
  };

  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getAllNotiByUser(token);
      setNotifications(data);
      setUnreadCount(data.filter((notif) => !notif.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, token]);

  // Gọi định kỳ mỗi 30 giây
  useEffect(() => {
    if (!token) return;
    fetchNotifications(); // Gọi lần đầu
    const interval = setInterval(fetchNotifications, 30000); // 30 giây
    return () => clearInterval(interval);
  }, [token]);

  const handleReadNotification = async (notiId) => {
    try {
      await readNoti(notiId, token);
      await fetchNotifications();
    } catch (error) {
      console.error("Error reading notification:", error);
    }
  };

  const handleDeleteNotification = async (notiId) => {
    try {
      await deleteNoti(notiId, token);
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Gọi API khi mở dropdown
  useEffect(() => {
    // if (showNotifications && token) {
    fetchNotifications();
    // }
  }, [showNotifications, token]);
  console.log(notifications);

  return (
    <header className="border-b border-gray-200 bg-white py-3">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Search */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Logo */}
          <div
            className="flex w-fit cursor-pointer items-center"
            onClick={() => navigate("/")}
          >
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
                className="focus:ring-main w-full rounded-lg border border-gray-300 py-2 pr-3.5 pl-10 focus:ring-1 focus:outline-none"
              />
              <FaMapMarkerAlt className="text-main absolute top-1/2 left-3 -translate-y-1/2 transform" />
            </div>

            {/* Search Input */}
            <div className="relative w-1/2 md:w-[60%]">
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(
                      `/search?q=${encodeURIComponent(searchQuery || "")}`,
                    );
                  }
                }}
                className="focus:ring-main w-full rounded-lg border border-gray-300 py-2 pr-12 pl-4 focus:ring-1 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="bg-main hover:bg-main-bold absolute inset-y-0 right-0 m-0.5 flex cursor-pointer items-center justify-center rounded-lg px-3 text-white"
              >
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
          <Link
            to={"/user/favorite-event"}
            className="hover:text-primary flex flex-col items-center"
          >
            <FaRegHeart size={18} className="FaRegHeart text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Yêu thích
            </span>
          </Link>
          {/* Notifications Link */}
          {/* <div
            className="hover:text-primary relative flex cursor-pointer flex-col items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNotifications((prev) => !prev);
            }}
          >
            <GrNotification size={18} className="text-gray-800" />
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Thông báo
            </span>

            {showNotifications && (
              <div
                className="absolute top-full right-0 z-10 mt-2 max-h-96 w-120 overflow-y-auto rounded-lg bg-white p-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loading1 isLoading={isLoading} />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-600">
                    Không có thông báo
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={notif.notificationId}
                      className={`mb-2 flex items-center rounded-md p-2 ${
                        !notif.isRead ? "bg-gray-100" : "bg-white"
                      }`}
                      onClick={() => {
                        if (!notif.isRead) {
                          handleReadNotification(notif.notificationId);
                        }
                      }}
                    >
                      <img
                        src={notif.image}
                        alt="Event"
                        className="mr-2 h-12 w-12 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                      </div>
                      {!notif.isRead ? (
                        <span className="bg-main-bold ml-2 h-2 w-2 rounded-full"></span>
                      ) : (
                        <button
                          className="ml-2 text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.notificationId);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div> */}
          <div
            className="hover:text-primary relative flex cursor-pointer flex-col items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNotifications((prev) => !prev);
            }}
          >
            <GrNotification size={18} className="text-gray-800" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              Thông báo
            </span>
            {showNotifications && (
              <div
                className="absolute top-full right-0 z-10 mt-2 max-h-96 w-120 overflow-y-auto rounded-lg bg-white p-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loading1 isLoading={isLoading} />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-600">
                    Không có thông báo
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={notif.notificationId}
                      className={`mb-2 flex items-center rounded-md p-2 ${
                        !notif.isRead ? "bg-gray-100" : "bg-white"
                      }`}
                      onClick={() => {
                        if (!notif.isRead) {
                          handleReadNotification(notif.notificationId);
                        }
                      }}
                    >
                      <img
                        src={notif.imageUrl}
                        alt="Event"
                        className="mr-2 h-12 w-12 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                      </div>
                      {!notif.isRead ? (
                        <span className="bg-main-bold ml-2 h-2 w-2 rounded-full"></span>
                      ) : (
                        <button
                          className="ml-2 text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.notificationId);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* User Info */}
          <div className="relative flex cursor-pointer" ref={userInfoRef}>
            {token ? (
              <div
                className="flex items-center space-x-2"
                onClick={toggleDropdown}
              >
                {/* avatar */}
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-300">
                  <img
                    src={avatar}
                    alt="User Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-textDark hidden lg:block">Tài khoản</span>
              </div>
            ) : (
              <div onClick={() => navigate("/login")}>
                <h2 className="text-main-bold cursor-pointer text-[15px] font-semibold sm:text-xl">
                  Đăng nhập
                </h2>
              </div>
            )}

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

        {/* Search and Location Bar on small screens */}
        <div className="flex w-full flex-col gap-2 md:hidden">
          {/* Location Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Choose a location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="focus:ring-secondary1 w-full rounded-lg border border-gray-300 py-2 pr-3.5 pl-10 focus:ring-1 focus:outline-none"
            />
            <FaMapMarkerAlt className="text-main absolute top-1/2 left-3 -translate-y-1/2 transform" />
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-secondary1 w-full rounded-lg border border-gray-300 py-2 pr-12 pl-4 focus:ring-1 focus:outline-none"
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
