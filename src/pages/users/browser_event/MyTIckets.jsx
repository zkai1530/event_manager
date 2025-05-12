import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  getMyTicketsByOrderStatus,
  reportOrder,
} from "services/user/orderService";
import Swal from "sweetalert2";

const MyTickets = () => {
  const { status = "all", timeFilter = "upcoming" } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const tabs = [
    { display: "Tất cả", value: "all" },
    { display: "Thành công", value: "paid" },
    { display: "Đang xử lý", value: "pending" },
    { display: "Đã hủy", value: "canceled" },
  ];
  const subTabs = [
    { display: "Sắp diễn ra", value: "upcoming" },
    { display: "Đã kết thúc", value: "past" },
  ];

  const [activeTab, setActiveTab] = useState(
    tabs.find((tab) => tab.value === status.toLowerCase())?.display || "Tất cả",
  );
  const [activeSubTab, setActiveSubTab] = useState(
    subTabs.find((subTab) => subTab.value === timeFilter.toLowerCase())
      ?.display || "Sắp diễn ra",
  );
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const statusMap = {
    "Tất cả": "ALL",
    "Thành công": "PAID",
    "Đang xử lý": "PENDING",
    "Đã hủy": "CANCELED",
  };
  const timeFilterMap = {
    "Sắp diễn ra": "upcoming",
    "Đã kết thúc": "past",
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getMyTicketsByOrderStatus(
        statusMap[activeTab],
        timeFilterMap[activeSubTab],
        page,
        token,
      );
      setTickets(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [activeTab, activeSubTab, page]);

  // Cập nhật URL khi activeTab hoặc activeSubTab thay đổi
  useEffect(() => {
    const tabValue =
      tabs.find((tab) => tab.display === activeTab)?.value || "all";
    const subTabValue =
      subTabs.find((subTab) => subTab.display === activeSubTab)?.value ||
      "upcoming";
    navigate(`/user/my-tickets/${tabValue}/${subTabValue}`);
  }, [activeTab, activeSubTab, navigate]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTicketForReport, setSelectedTicketForReport] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState("");

  useEffect(() => {
    const fetchReasons = async () => {
      // Giả lập dữ liệu với reasonId và reason
      const mockReasons = [
        { reasonId: 1, reason: "Sự kiện không diễn ra" },
        { reasonId: 2, reason: "Không được check-in dù đã mua vé" },
        { reasonId: 3, reason: "Thông tin sự kiện sai lệch" },
        { reasonId: 4, reason: "Sự kiện có dấu hiệu lừa đảo" },
        { reasonId: 5, reason: "Lý do khác" },
      ];
      setReasons(mockReasons);
    };
    fetchReasons();
  }, []);

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const openModal = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeModal = () => {
    setSelectedTicket(null);
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString("vi-VN", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const qrRef = useRef(null);

  const handleDownload = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const imageURL = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReportOrder = async (orderId, reasonId) => {
    try {
      const response = await reportOrder(orderId, reasonId, token);
      if (response.message === "Access Denied!") {
        Swal.fire({
          title: "Lỗi!",
          text: "Bạn không có quyền báo cáo đơn hàng này",
          icon: "error",
          confirmButtonText: "OK",
        });
        return false;
      } else if (response.message === "Request was successful!") {
        Swal.fire({
          title: "Thành công!",
          text: "Bạn đã báo cáo thành công",
          icon: "success",
          confirmButtonText: "OK",
        });
        return true;
      } else if (
        response.message ===
        "You have already submitted a complaint for this order."
      ) {
        Swal.fire({
          title: "Cảnh báo!",
          text: "Bạn đã báo cáo đơn hàng này rồi",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return false;
      }
    } catch (err) {
      console.error("Error reporting order:", err);
      Swal.fire({
        title: "Lỗi!",
        text: "Đã có lỗi xảy ra",
        icon: "error",
        confirmButtonText: "OK",
      });
      return false;
    }
  };

  return (
    <div className="mt-5 min-h-screen">
      <h1 className="text-main-bold font-inter mb-5 text-4xl font-bold">
        Vé đã mua
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab.display}
            onClick={() => {
              setActiveTab(tab.display);
              setPage(0);
            }}
            className={`mx-1 flex-1 cursor-pointer rounded-full px-4 py-2 text-center font-bold transition-colors ${
              activeTab === tab.display
                ? "bg-main text-white"
                : "border-main border-2 text-gray-600"
            }`}
          >
            {tab.display}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="mb-6 flex justify-center space-x-4">
        {subTabs.map((subTab) => (
          <button
            key={subTab.display}
            onClick={() => {
              setActiveSubTab(subTab.display);
              setPage(0);
            }}
            className={`relative cursor-pointer px-4 py-1 font-semibold transition-colors ${
              activeSubTab === subTab.display
                ? "border-main-bold border-b-2 text-gray-700"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {subTab.display}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="border-t-main-bold flex h-23 w-23 animate-spin items-center justify-center rounded-full border-6 border-transparent">
            <div className="border-t-emphasis flex h-16 w-16 animate-spin items-center justify-center rounded-full border-6 border-transparent" />
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center">
          <div className="mb-4 h-64 w-64 overflow-hidden rounded-full">
            <img
              src="https://media.licdn.com/dms/image/v2/C5112AQEw1fXuabCTyQ/article-inline_image-shrink_1500_2232/article-inline_image-shrink_1500_2232/0/1581099611064?e=1750896000&v=beta&t=fblYUKpkCWv7sAgz1kS7_a7oMZlVJxQ-G464m5HC0YM"
              alt="No tickets"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-lg">Bạn chưa có vé nào</p>
        </div>
      ) : (
        <div className="mt-12">
          {tickets.map((ticket) => (
            <div
              key={ticket.orderId}
              className="border-main mb-6 flex items-center rounded-lg p-4 hover:border-0 hover:shadow-[0px_0px_8px_0px_#97F9FF,0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
            >
              <img
                src={ticket.eventImageUrl}
                alt={ticket.eventName}
                className="h-24 w-24 rounded-md object-cover"
              />
              <div className="ml-4 flex-1">
                <h2 className="text-main-bold text-lg font-bold uppercase">
                  {ticket.eventName}
                </h2>
                <p className="text-sm text-orange-500">
                  Bắt đầu vào lúc{" "}
                  {formatDateTime(ticket.scheduleDate, ticket.startTime)}
                </p>
                <p className="text-sm text-gray-600">
                  {ticket.location.address}, {ticket.location.city},{" "}
                  {ticket.location.country}
                </p>
                <p
                  className={
                    `font-bold ` +
                    (ticket.status === "PAID"
                      ? "text-green-400"
                      : ticket.status === "PENDING"
                        ? "text-yellow-400"
                        : ticket.status === "CANCELED"
                          ? "text-red-400"
                          : "text-gray-600")
                  }
                >
                  {ticket.status === "PAID"
                    ? "Đã thanh toán"
                    : ticket.status === "PENDING"
                      ? "Đang xử lý"
                      : ticket.status === "CANCELED"
                        ? "Đã hủy"
                        : ticket.status}
                </p>
              </div>
              {ticket.status === "PAID" && (
                <button
                  onClick={() => {
                    setSelectedTicketForReport(ticket);
                    setShowReportModal(true);
                  }}
                  disabled={ticket.complaint}
                  className={`cursor-pointer rounded-full px-4 py-2 text-white ${
                    ticket.complaint
                      ? "!cursor-not-allowed bg-gray-400"
                      : "bg-red-400 hover:bg-red-500"
                  }`}
                >
                  {ticket.complaint ? "Đã báo cáo" : "Báo cáo"}
                </button>
              )}
              <button
                onClick={() => openModal(ticket)}
                className="bg-main ml-2 cursor-pointer rounded-full px-4 py-2 text-white"
              >
                Chi tiết vé
              </button>
            </div>
          ))}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className="px-4 py-2 disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
          <div className="relative w-[600px] rounded-lg bg-white p-6 shadow-lg">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 cursor-pointer text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="mb-4 text-2xl font-bold">Chi tiết vé</h2>
            {selectedTicket.status === "PAID" ? (
              <div className="mb-4 flex justify-center" ref={qrRef}>
                <QRCodeCanvas value={selectedTicket.qrCode} size={150} />
              </div>
            ) : (
              <p className="mb-4 text-center text-gray-600">
                Vé chưa được thanh toán hoặc đã hủy, không có mã QR.
              </p>
            )}
            <p className="mb-2">
              <strong>Mã đơn hàng:</strong> {selectedTicket.orderCode}
            </p>
            <p className="mb-2">
              <strong>Tổng giá:</strong>{" "}
              {selectedTicket.totalPrice.toLocaleString("vi-VN")} VND
            </p>
            <p className="mb-2">
              <strong>Vé:</strong>
            </p>
            <ul className="mb-4">
              {selectedTicket.tickets.map((ticket, index) => (
                <li key={index} className="ml-4">
                  - {ticket.ticketName}: {ticket.quantity} vé
                </li>
              ))}
            </ul>
            {selectedTicket.status !== "PAID" ? (
              <button
                onClick={closeModal}
                className="bg-main w-full cursor-pointer rounded-full px-4 py-2 text-white"
              >
                Đóng
              </button>
            ) : (
              <button
                // onClick={closeModal}
                onClick={handleDownload}
                className="bg-main w-full cursor-pointer rounded-full px-4 py-2 text-white"
              >
                Tải xuống mã QR
              </button>
            )}
          </div>
        </div>
      )}

      {showReportModal && selectedTicketForReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
          <div className="relative flex flex-col rounded-lg bg-white p-6 shadow-lg">
            <div className="w-full max-w-md rounded-lg bg-white p-3">
              <h2 className="mb-4 text-lg font-bold">Báo cáo đơn hàng</h2>
              <div className="mb-4 flex flex-col gap-3">
                {reasons.map((item, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reason"
                      value={item.reasonId}
                      checked={selectedReason === item.reasonId.toString()}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="h-4 w-4"
                    />
                    <span>{item.reason}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReason("");
                  }}
                  className="rounded-full bg-gray-300 px-4 py-2"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    if (!selectedReason) {
                      Swal.fire({
                        title: "Cảnh báo!",
                        text: "Vui lòng chọn lý do báo cáo!",
                        icon: "warning",
                        confirmButtonText: "OK",
                      });
                      return;
                    }
                    const success = await handleReportOrder(
                      selectedTicketForReport.orderId,
                      Number(selectedReason),
                    );
                    if (success) {
                      setTickets((prevTickets) =>
                        prevTickets.map((t) =>
                          t.orderId === selectedTicketForReport.orderId
                            ? { ...t, complaint: true }
                            : t,
                        ),
                      );
                    }
                    setShowReportModal(false);
                    setSelectedReason("");
                  }}
                  className="rounded-full bg-red-500 px-4 py-2 text-white"
                >
                  Báo cáo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
