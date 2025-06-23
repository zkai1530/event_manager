import { useState, useEffect } from "react";
import {
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { getAllComplaints } from "@/services/admin/complaintService";

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const itemsPerPage = 15;
  const token = localStorage.getItem("token");

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const response = await getAllComplaints(token, currentPage - 1);
        // Ánh xạ dữ liệu cho khớp với frontend
        const mappedComplaints = response.content.map((item) => ({
          complaint_id: item.complaintId,
          order_id: item.orderId,
          user: { name: item.userName, email: item.email },
          event: { event_id: item.eventId, name: item.eventName },
          description: item.description,
          status: item.status,
          created_at: item.createdAt,
          order_refunded: false, // Giả định, cần API bổ sung
          event_refunded: false, // Giả định, cần API bổ sung
        }));
        setComplaints(mappedComplaints);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [currentPage, token]);

  // Filter and pagination logic
  useEffect(() => {
    let result = [...complaints];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((complaint) => complaint.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (complaint) =>
          complaint.description.toLowerCase().includes(lowercasedSearch) ||
          complaint.order_id.toString().includes(lowercasedSearch) ||
          complaint.user.name.toLowerCase().includes(lowercasedSearch) ||
          complaint.event.name.toLowerCase().includes(lowercasedSearch),
      );
    }

    setFilteredComplaints(result);
  }, [searchTerm, statusFilter, complaints]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = filteredComplaints.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const [totalPages, setTotalPages] = useState(1);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  // Handle complaint resolution
  const handleResolveComplaint = async (complaintId, action) => {
    setLoading(true);
    // try {
    //   await resolveComplaint(complaintId, action);
    //   const response = await getAllComplaints(currentPage - 1);
    //   const data = response.data;
    //   const mappedComplaints = data.content.map((item) => ({
    //     complaint_id: item.complaintId,
    //     order_id: item.orderId,
    //     user: { name: item.userName, email: item.email },
    //     event: { event_id: item.eventId, name: item.eventName },
    //     description: item.description,
    //     status: item.status,
    //     created_at: item.createdAt,
    //     order_refunded: false,
    //     event_refunded: false,
    //   }));
    //   setComplaints(mappedComplaints);
    //   setTotalPages(data.totalPages);
    //   setSelectedComplaint(null);
    // } catch (error) {
    //   console.error("Error resolving complaint:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  // Handle refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getAllComplaints(0);
      const data = response.data;
      const mappedComplaints = data.content.map((item) => ({
        complaint_id: item.complaintId,
        order_id: item.orderId,
        user: { name: item.userName, email: item.email },
        event: { event_id: item.eventId, name: item.eventName },
        description: item.description,
        status: item.status,
        created_at: item.createdAt,
        order_refunded: false,
        event_refunded: false,
      }));
      setComplaints(mappedComplaints);
      setTotalPages(data.totalPages);
      setSearchTerm("");
      setStatusFilter("all");
      setCurrentPage(1);
    } catch (error) {
      console.error("Error refreshing complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = "";
    let textColor = "";

    switch (status) {
      case "pending":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "resolved":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "dismissed":
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        break;
      default:
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
    }

    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${bgColor} ${textColor}`}
      >
        {status === "pending"
          ? "Đang chờ"
          : status === "resolved"
            ? "Đã giải quyết"
            : "Đã bác bỏ"}
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-main p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold uppercase">Quản lý khiếu nại</h1>
      </header>

      {/* Main content */}
      <div className="">
        <div className="py-6">
          {/* Filters */}
          <div className="mb-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Status filter */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select
                  className="block w-full rounded-md border-gray-300 py-2 pr-3 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Đang chờ</option>
                  <option value="resolved">Đã giải quyết</option>
                  <option value="dismissed">Đã bác bỏ</option>
                </select>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-end text-sm">
                <span className="text-gray-600">
                  {/* Hiển thị */}
                  <span className="font-semibold">
                    {filteredComplaints.length}
                  </span>{" "}
                  khiếu nại
                </span>
              </div>
            </div>
          </div>

          {/* Complaints table */}
          <div className="overflow-hidden shadow sm:rounded-lg">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <table className="table-layout-fixed w-full max-w-full divide-y divide-gray-200">
                  <thead className="bg-main">
                    <tr>
                      <th
                        scope="col"
                        className="px-2 py-2 text-left text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "3%" }}
                      >
                        STT
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "15%" }}
                      >
                        Người dùng
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "17%" }}
                      >
                        Sự kiện
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "25%" }}
                      >
                        Mô tả
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "10%" }}
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "10%" }}
                      >
                        Ngày tạo
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "10%" }}
                      >
                        Hoàn tiền
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-right text-xs font-medium tracking-wider text-white uppercase"
                        style={{ width: "10%" }}
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentComplaints.length > 0 ? (
                      currentComplaints.map((complaint, index) => (
                        <tr
                          key={complaint.complaint_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-gray-900">
                            {(currentPage - 1) * 15 + index + 1}
                          </td>
                          <td className="px-3 py-3 text-sm whitespace-normal text-gray-900">
                            <div className="overflow-hidden">
                              <div className="line-clamp-1 overflow-hidden font-medium text-ellipsis">
                                {complaint.user.name}
                              </div>
                              <div className="line-clamp-1 overflow-hidden text-xs break-all text-ellipsis text-gray-500">
                                {complaint.user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm whitespace-normal text-gray-900">
                            <div>
                              <div className="line-clamp-1 font-medium">
                                {complaint.event.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {complaint.event.event_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                            <div className="line-clamp-2">
                              {complaint.description}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <StatusBadge status={complaint.status} />
                          </td>
                          <td className="px-3 py-3 text-center text-sm whitespace-nowrap text-gray-500">
                            {formatDate(complaint.created_at)}
                          </td>
                          <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                            <div className="flex flex-col space-y-1">
                              {/* <div className="flex items-center">
                                <span
                                  className={`mr-1 h-2 w-2 rounded-full ${
                                    complaint.order_refunded
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                ></span>
                                <span>Đơn hàng</span>
                              </div> */}
                              <div className="flex items-center">
                                <span
                                  className={`mr-1 h-2 w-2 rounded-full ${
                                    complaint.event_refunded
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                ></span>
                                <span>Sự kiện</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => setSelectedComplaint(complaint)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 py-10 text-center text-sm text-gray-500"
                        >
                          Không tìm thấy khiếu nại nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {filteredComplaints.length > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Sau
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Hiển thị{" "}
                          <span className="font-medium">
                            {indexOfFirstItem + 1}
                          </span>{" "}
                          đến{" "}
                          <span className="font-medium">
                            {Math.min(
                              indexOfLastItem,
                              filteredComplaints.length,
                            )}
                          </span>{" "}
                          trong{" "}
                          <span className="font-medium">
                            {filteredComplaints.length}
                          </span>{" "}
                          kết quả
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 border-indigo-500 bg-indigo-50 text-indigo-600"
                                  : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                              } `}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Complaint details modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-10">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-[rgba(57,54,79,0.8)] transition-opacity"
              onClick={() => setSelectedComplaint(null)}
            ></div>

            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            ></span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="mb-4 text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Chi tiết khiếu nại #{selectedComplaint.complaint_id}
                    </h3>

                    <div className="mb-4 rounded-lg bg-gray-50 p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Đơn hàng
                          </p>
                          <p className="mt-1 text-sm text-gray-900">
                            #{selectedComplaint.order_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Trạng thái
                          </p>
                          <p className="mt-1">
                            <StatusBadge status={selectedComplaint.status} />
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Người dùng
                          </p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedComplaint.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedComplaint.user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Sự kiện
                          </p>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedComplaint.event.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {selectedComplaint.event.event_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Ngày tạo
                          </p>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(selectedComplaint.created_at)}
                          </p>
                        </div>
                        <div>
                          {/* <p className="text-sm font-medium text-gray-500">
                            Hoàn tiền
                          </p> */}
                          {/* <div className="mt-1 flex flex-col space-y-1">
                            <div className="flex items-center">
                              <span
                                className={`mr-1 h-2 w-2 rounded-full ${selectedComplaint.order_refunded ? "bg-green-500" : "bg-gray-300"}`}
                              ></span>
                              <span className="text-sm">
                                {selectedComplaint.order_refunded
                                  ? "Đã hoàn tiền đơn hàng"
                                  : "Chưa hoàn tiền đơn hàng"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`mr-1 h-2 w-2 rounded-full ${selectedComplaint.event_refunded ? "bg-green-500" : "bg-gray-300"}`}
                              ></span>
                              <span className="text-sm">
                                {selectedComplaint.event_refunded
                                  ? "Đã hoàn tiền sự kiện"
                                  : "Chưa hoàn tiền sự kiện"}
                              </span>
                            </div>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-500">
                        Mô tả khiếu nại
                      </p>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-900">
                          {selectedComplaint.description}
                        </p>
                      </div>
                    </div>

                    {selectedComplaint.status === "pending" && (
                      <div className="flex flex-col space-y-3">
                        <p className="text-sm font-medium text-gray-500">
                          Thao tác
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              handleResolveComplaint(
                                selectedComplaint.complaint_id,
                                "resolve",
                              )
                            }
                            className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm leading-4 font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                          >
                            <Check size={16} className="mr-1" />
                            Chấp nhận
                          </button>
                          <button
                            onClick={() =>
                              handleResolveComplaint(
                                selectedComplaint.complaint_id,
                                "dismiss",
                              )
                            }
                            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm leading-4 font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                          >
                            <X size={16} className="mr-1" />
                            Không chấp nhận
                          </button>
                          {/* {!selectedComplaint.order_refunded && (
                            <button
                              onClick={() =>
                                handleResolveComplaint(
                                  selectedComplaint.complaint_id,
                                  "refund-order",
                                )
                              }
                              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                              <ArrowDown size={16} className="mr-1" />
                              Hoàn tiền đơn hàng
                            </button>
                          )}
                          {!selectedComplaint.event_refunded && (
                            <button
                              onClick={() =>
                                handleResolveComplaint(
                                  selectedComplaint.complaint_id,
                                  "refund-event",
                                )
                              }
                              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm leading-4 font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                            >
                              <ArrowDown size={16} className="mr-1" />
                              Hoàn tiền sự kiện
                            </button>
                          )} */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
