import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
  blockUser,
  getAllUsers,
  searchUser,
  unblockUser,
} from "@/services/admin/userService";
import Loading1 from "@/components/ui/Loading1";

const UserManagement = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [refresh, setRefresh] = useState(false);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = searchText
        ? await searchUser(token, searchText, page - 1)
        : await getAllUsers(token, page - 1);

      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("fetchUsers ", error.response.data);
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể tải danh sách người dùng.",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [page, searchText, refresh]);

  // Block user
  const handleBlockUser = async (user) => {
    const result = await Swal.fire({
      title: "Chặn người dùng?",
      text: `Bạn có chắc muốn chặn ${user.email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9d2ff7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Chặn",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await blockUser(token, user.userId);
        if (response.message === "User has been successfully blocked!") {
          Swal.fire({
            title: "Thành công!",
            text: `Đã chặn ${user.email}.`,
            icon: "success",
          });
          await fetchUsers()
          setRefresh((prev) => !prev);
        }
      } catch (error) {
        console.error("blockUser ", error.response.data);
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể chặn người dùng.",
          icon: "error",
        });
      }
    }
  };

  // Unblock user
  const handleUnblockUser = async (user) => {
    const result = await Swal.fire({
      title: "Bỏ chặn người dùng?",
      text: `Bạn có chắc muốn bỏ chặn ${user.email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9d2ff7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Bỏ chặn",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await unblockUser(token, user.userId);
        if (response.message === "User has been successfully unblocked!") {
          Swal.fire({
            title: "Thành công!",
            text: `Đã bỏ chặn ${user.email}.`,
            icon: "success",
          });
          setRefresh((prev) => !prev);
        }
      } catch (error) {
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể bỏ chặn người dùng.",
          icon: "error",
        });
      }
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleKeyDownSearch = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      navigate(`/admin/user-management?q=${searchText.trim()}&page=1`);
    }
  };

  // Handle page change
  const handlePageChange = (e, value) => {
    setPage(value);
    navigate(`/users?q=${searchText.trim()}&page=${value}`);
  };

  return (
    <div className="py-4">
      <header className="bg-main mb-5 p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold uppercase">Quản lý người dùng</h1>
      </header>
      <div className="rounded-xl bg-white p-4 shadow-xl sm:p-6">
        {/* Filters */}
        <div className="mb-4">
          <span className="font-bold">Tìm kiếm</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email"
            value={searchText}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDownSearch}
            className="focus:border-main focus:ring-main w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-layout-fixed w-full divide-y divide-gray-200">
            <thead className="bg-main text-white">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "5%" }}
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "30%" }}
                >
                  Thông tin
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "15%" }}
                >
                  Số điện thoại
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "14%" }}
                >
                  Vé bán
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "12%" }}
                >
                  Vé mua
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-center text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "12%" }}
                >
                  Sự kiện
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-right text-xs font-medium tracking-wider uppercase sm:px-4 sm:py-3"
                  style={{ width: "12%" }}
                >
                  Hoạt động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="inline-flex items-center justify-center">
                      <Loading1 isLoading={true} />
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-gray-900 sm:px-4 sm:py-3">
                      {(page - 1) * 15 + index + 1}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 sm:px-4 sm:py-3">
                      <div className="flex items-center">
                        <img
                          src={
                            user.avatarUrl || "https://via.placeholder.com/40"
                          }
                          alt={user.name}
                          className="mr-3 h-10 w-10 rounded-full"
                        />
                        <div>
                          <div className="line-clamp-1 overflow-hidden font-bold text-ellipsis">
                            {user.name}
                          </div>
                          <div className="line-clamp-1 overflow-hidden break-words text-ellipsis text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-sm whitespace-nowrap text-gray-900 sm:px-4 sm:py-3">
                      {user.phoneNumber || "-"}
                    </td>
                    <td className="px-3 py-2 text-center text-sm whitespace-nowrap text-gray-900 sm:px-4 sm:py-3">
                      {user.totalSoldTickets}
                    </td>
                    <td className="px-3 py-2 text-center text-sm whitespace-nowrap text-gray-900 sm:px-4 sm:py-3">
                      {user.totalPurchasedTickets}
                    </td>
                    <td className="px-3 py-2 text-center text-sm whitespace-nowrap text-gray-900 sm:px-4 sm:py-3">
                      {user.totalEvents}
                    </td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap text-gray-900 sm:px-4 sm:py-3">
                      <div className="flex w-full justify-end">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={user.isActive}
                            onChange={() =>
                              user.isActive
                                ? handleBlockUser(user)
                                : handleUnblockUser(user)
                            }
                            className="peer sr-only"
                          />
                          <div className="group peer h-8 w-16 rounded-full bg-rose-400 shadow-md ring-0 duration-300 outline-none peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:top-1 after:left-1 after:flex after:h-6 after:w-6 after:items-center after:justify-center after:rounded-full after:bg-gray-50 after:duration-300 after:content-[''] after:outline-none peer-checked:after:translate-x-8 peer-hover:after:scale-95">
                            <svg
                              className="absolute top-1 left-8 h-6 w-6 stroke-gray-900"
                              height="100"
                              preserveAspectRatio="xMidYMid meet"
                              viewBox="0 0 100 100"
                              width="100"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M30,46V38a20,20,0,0,1,40,0v8a8,8,0,0,1,8,8V74a8,8,0,0,1-8,8H30a8,8,0,0,1-8-8V54A8,8,0,0,1,30,46Zm32-8v8H38V38a12,12,0,0,1,24,0Z"
                                fill-rule="evenodd"
                                className="fill-gray-900"
                              />
                            </svg>
                            <svg
                              className="absolute top-1 left-1 h-6 w-6 stroke-gray-900"
                              height="100"
                              preserveAspectRatio="xMidYMid meet"
                              viewBox="0 0 100 100"
                              width="100"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                className="fill-gray-700"
                                d="M50,18A19.9,19.9,0,0,0,30,38v8a8,8,0,0,0-8,8V74a8,8,0,0,0,8,8H70a8,8,0,0,0,8-8V54a8,8,0,0,0-8-8H38V38a12,12,0,0,1,23.6-3,4,4,0,1,0,7.8-2A20.1,20.1,0,0,0,50,18Z"
                              />
                            </svg>
                          </div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key={""}>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-sm text-gray-500 sm:px-4 sm:py-10"
                  >
                    Không tìm thấy người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <nav className="inline-flex rounded-md shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(null, pageNum)}
                    className={`border px-3 py-1 text-sm font-medium ${
                      page === pageNum
                        ? "border-main bg-main text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    } ${
                      pageNum === 1 ? "rounded-l-md" : ""
                    } ${pageNum === totalPages ? "rounded-r-md" : ""}`}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
