import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "@/components/ui/Loading";
import {
  getEligibleDisbursementEvents,
  getUndisbursementSchedulesOfEvent,
} from "@/services/admin/disbursementService";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FormatPrice } from "@/utils/formatPrice";
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";

const DisbursementManagement = () => {
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [modalSchedule, setModalSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch danh sách sự kiện đủ điều kiện giải ngân
  useEffect(() => {
    setIsLoading(true);
    getEligibleDisbursementEvents(token)
      .then((data) => {
        const eventData = data?.content || [];
        setEvents(eventData);
      })
      .catch((err) =>
        console.error("getEligibleDisbursementEvents: ", err.response.data),
      )
      .finally(() => setIsLoading(false));
  }, [token]);

  // Fetch danh sách lịch trình khi click vào sự kiện
  const fetchSchedules = async (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getUndisbursementSchedulesOfEvent(eventId, token);
      setSchedules((prev) => ({
        ...prev,
        [eventId]: data || [],
      }));
      setExpandedEventId(eventId);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(schedules);

  const handleOpenModal = (event, schedule) => {
    if (!event.accountNumber || !event.accountName || !event.bankShortName) {
      alert("Thông tin tài khoản không đầy đủ!");
      return;
    }

    const bankId = event.bankShortName.toLowerCase();
    const accountNo = event.accountNumber;
    const accountName = event.accountName;
    const amount = schedule.totalPrice;
    const addInfo = "Admin giải ngân";

    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;

    setQrData({ qrUrl, amount, addInfo, accountName });
    setIsImageLoading(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setQrData(null);
  };

  // Mở/Đóng modal
  const toggleModal = (schedule) => {
    setModalSchedule(modalSchedule ? null : schedule);
  };

  const handleConfirmDisbursement = () => {
    Swal.fire({
      title: "Xác nhận đã giải ngân?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận!",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
        setIsModalOpen(false);
      }
    });
    
  };

  return (
    <div className="min-h-screen rounded-xl p-2">
      {/* Header */}
      <header className="bg-main mb-5 p-4 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Tổng quan giải ngân</h1>
      </header>

      {/* Danh sách sự kiện */}
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.eventId}
            className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg"
          >
            {/* Tiêu đề sự kiện */}
            <div
              className="flex cursor-pointer items-center justify-between p-3"
              onClick={() => fetchSchedules(event.eventId)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={event.imageUrl || "/default-event-image.jpg"}
                  alt={event.eventName}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {event.eventName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Sự kiện có lịch trình chưa giải ngân
                  </p>
                </div>
              </div>
              <button className="text-gray-600 transition hover:text-gray-800">
                {expandedEventId === event.eventId ? (
                  <svg
                    className="h-6 w-6 rotate-180 transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Dropdown bảng lịch trình */}
            {expandedEventId === event.eventId &&
              schedules[event.eventId] &&
              Array.isArray(schedules[event.eventId]) && (
                <div className="border-t bg-white p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-main">
                      <tr>
                        <th
                          scope="col"
                          className="w-[20%] px-6 py-3 text-start text-xs font-medium text-white uppercase"
                        >
                          Thời gian diễn ra
                        </th>
                        <th
                          scope="col"
                          className="w-[20%] px-6 py-3 text-center text-xs font-medium text-white uppercase"
                        >
                          tổng tiền
                        </th>
                        <th
                          scope="col"
                          className="w-[20%] px-6 py-3 text-center text-xs font-medium text-white uppercase"
                        >
                          số vé bán
                        </th>
                        <th
                          scope="col"
                          className="w-[20%] px-6 py-3 text-center text-xs font-medium text-white uppercase"
                        >
                          TÌNH TRẠNG
                        </th>
                        <th
                          scope="col"
                          className="w-[20%] px-6 py-3 text-end text-xs font-medium text-white uppercase"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {schedules[event.eventId].map((schedule) => (
                        <tr
                          key={schedule.scheduleId}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {new Date(
                              schedule.scheduleDate,
                            ).toLocaleDateString()}{" "}
                            {schedule.startTime}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-800">
                            {FormatPrice(schedule.totalPrice.toString())}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-800">
                            {schedule.soldTickets} /{" "}
                            {schedule.totalAvailableQuantity} vé
                          </td>
                          <td className="relative flex items-center justify-center px-4 py-2 text-center text-sm text-gray-800">
                            {schedule.fraud ? (
                              <span className="group">
                                <FaExclamationTriangle
                                  style={{
                                    color: "red",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => toggleModal(schedule)}
                                />
                                <span className="absolute top-1 -right-1/5 hidden -translate-x-1/2 transform items-center justify-center rounded bg-gray-700 p-1 text-xs text-white group-hover:block">
                                  Nghi gian lận
                                </span>
                              </span>
                            ) : (
                              <span className="group">
                                <FaCheckCircle
                                  style={{
                                    color: "green",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => toggleModal(schedule)}
                                />
                                <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 transform rounded bg-gray-700 p-1 text-xs text-white group-hover:block">
                                  Bình thường
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-end text-sm">
                            <button
                              className="cursor-pointer text-blue-600 hover:text-blue-800"
                              onClick={() => handleOpenModal(event, schedule)}
                            >
                              Giải ngân
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
          <div className="relative flex h-[90vh] w-[600px] flex-col rounded-lg bg-white p-6 shadow-lg">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setModalSchedule(null)}
            >
              <IoMdClose size={25} className="mt-3 cursor-pointer" />
            </button>
            <h2 className="mb-4 text-2xl font-bold">Chi tiết Tình trạng</h2>
            <div className="mb-6 flex space-x-6">
              <p className="text-lg">
                Phàn nàn: {modalSchedule.complaintRatio.toFixed(2)}%
              </p>
              <p className="text-lg">
                Check-in: {modalSchedule.checkInRatio.toFixed(2)}%
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {modalSchedule.complaints &&
              modalSchedule.complaints.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-main">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase">
                        Người dùng
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-white uppercase">
                        Lý do
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {modalSchedule.complaints.map((complaint, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {complaint.userName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {complaint.reasonName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Không có phàn nàn</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal disbursement */}
      {isModalOpen && qrData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
          <div className="relative flex h-[90vh] w-[700px] flex-col rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Mã QR Giải Ngân</h2>
            <div className="flex flex-col items-center">
              {isImageLoading && (
                <div className="mb-4 flex h-96 w-96 items-center justify-center">
                  <div className="border-t-main-bold flex h-23 w-23 animate-spin items-center justify-center rounded-full border-6 border-transparent">
                    <div className="border-t-emphasis flex h-16 w-16 animate-spin items-center justify-center rounded-full border-6 border-transparent" />
                  </div>
                </div>
              )}
              <img
                src={qrData.qrUrl}
                alt="QR Code"
                className={`mb-4 h-96 w-96 object-contain ${isImageLoading ? "hidden" : "block"}`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
              <p className="mb-4 text-sm">Nội dung: {qrData.addInfo}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="cursor-pointer rounded-full bg-red-400 px-4 py-2 text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDisbursement}
                className="bg-main-bold cursor-pointer rounded-full px-4 py-2 text-white"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      <Loading isLoading={isLoading} />
    </div>
  );
};

export default DisbursementManagement;
