import Loading from "@/components/ui/Loading";
import { useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { FaBan } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  deleteEvent,
  getEventListInfoByUser,
} from "services/user/eventService";
import Swal from "sweetalert2";
import { formatSchedule } from "utils/formatSchedule";

const ListEvents = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("page") || "0", 10);
  });
  const [totalPages, setTotalPages] = useState(0);
  const [timeFilter, setTimeFilter] = useState(() => {
    const status = window.location.pathname.split("/events/")[1] || "all";
    return status === "all" ? "all" : status;
  });

  const loadEventsData = async () => {
    setIsLoading(true);
    getEventListInfoByUser(token, page, timeFilter)
      .then((data) => {
        setEvents(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        console.error("getEventListInfoByUser", err);
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadEventsData();
  }, [token, page, timeFilter]);
  console.log("aa", events);

  const handleDeleteEvent = async (eventId, eventName) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc chắn muốn xóa sự kiện "${eventName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#e74c3c",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        const data = await deleteEvent(eventId, token);
        if (data.message === "Delete event was successfully!") {
          Swal.fire({
            title: "Xóa sự kiện thành công!",
            text: `Sự kiện "${eventName}" đã được xóa.`,
            icon: "success",
          });

          await loadEventsData();
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Xóa sự kiện không thành công!`,
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Delete event error", error);
        if (
          error.response.data?.data.includes(
            "This event has tickets that have already been sold for the schedule on",
          )
        ) {
          const message = error.response.data.data;

          // Dùng regex để tách ngày, giờ
          const match = message.match(
            /Schedule on (\d{4}-\d{2}-\d{2}) starting at (\d{2}:\d{2})/,
          );

          let msg = "Không thể xoá vì sự kiện này đã có người mua vé.";
          // if (match) {
          //   const [_, dateStr, timeStr] = match;
          //   const [year, month, day] = dateStr.split("-");
          //   msg = `Không thể gỡ lịch trình ngày ${day}-${month}-${year} bắt đầu lúc ${timeStr} vì đã có người dùng mua vé này.`;
          // }

          Swal.fire({
            title: "Lỗi!",
            text: msg,
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Xóa sự kiện không thành công!`,
            icon: "error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <h1 className="font-logo text-main-bold mb-4 text-6xl font-[900]">
        Events
      </h1>

      {/* Search and Buttons */}
      <div className="mb-15 flex items-center justify-between">
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện"
              className="rounded-lg border py-2 pr-4 pl-10 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <svg
              className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          {/* <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4h12v12H4z" />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                d="M4 8h12M4 12h12"
              />
            </svg>
            <span>Danh sách</span>
          </button>
          <button className="flex items-center space-x-2 rounded-lg border px-4 py-2 text-gray-700">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-2v4m0 0H8m4 0h4"
              />
            </svg>
            <span>Dạng lịch</span>
          </button> */}
          <div className="">
            <select
              value={timeFilter}
              onChange={(e) => {
                const newFilter = e.target.value;
                setTimeFilter(newFilter);
                navigate(`/organizations/events/${newFilter}?page=${page}`);
              }}
              className="rounded-lg border px-4 py-2"
            >
              <option value="all">Tất cả</option>
              <option value="upcoming">Sắp xảy ra</option>
              <option value="past">Đã qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* List Events */}
      <div className="-mt-10 flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="inline-block min-w-full p-1.5 align-middle">
            <div className="overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary1">
                  <tr>
                    <th
                      scope="col"
                      className="w-[50%] px-6 py-3 text-start text-xs font-medium text-white uppercase"
                    >
                      Sự kiện
                    </th>
                    <th
                      scope="col"
                      className="w-[20%] px-6 py-3 text-start text-xs font-medium text-white uppercase"
                    >
                      LƯỢT BÁN
                    </th>
                    <th
                      scope="col"
                      className="w-[15%] px-6 py-3 text-start text-xs font-medium text-white uppercase"
                    >
                      TÌNH TRẠNG
                    </th>
                    <th
                      scope="col"
                      className="w-[15%] px-6 py-3 text-end text-xs font-medium text-white uppercase"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="cursor-pointer divide-y divide-gray-200">
                  {events.length > 0 &&
                    events.map((event) => {
                      let scheduleString = null;
                      if (event.eventType === "SINGLE") {
                        const {
                          dayOfWeek,
                          formattedDate,
                          formattedStartTime,
                          formattedEndTime,
                        } = formatSchedule(event.scheduleItem);
                        scheduleString = `${dayOfWeek}, ${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
                      }
                      return (
                        <tr
                          key={event.eventId}
                          onClick={() =>
                            navigate(`/manage/event/${event.eventId}/details`)
                          }
                          className="transition-shadow hover:relative hover:shadow-md"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <img
                                // src="/event_background.jpg"
                                src={event.imageUrl}
                                alt="Event"
                                className="h-14 w-14 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-gray-800">
                                  {event.name}
                                </p>
                                {scheduleString ? (
                                  <p className="text-sm text-gray-500">
                                    {scheduleString}
                                  </p>
                                ) : (
                                  <p className="text-xs font-semibold text-green-600">
                                    Recurring event
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800">
                            {event.totalTicketsSold}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800">
                            {event.isPublished ? "Đã ra mắt" : "Phác thảo"}
                          </td>
                          <td className="space-x-2 text-end text-sm font-medium">
                            <button
                              type="button"
                              // onClick={() => {
                              //   handlePromotionSelect(promotion);
                              //   setIsOpen(true);
                              // }}
                              className="cursor-pointer rounded-sm bg-blue-100 p-2"
                            >
                              <AiFillEdit size={18} className="text-blue-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.eventId, event.name);
                              }}
                              className="cursor-pointer rounded-sm bg-red-100 p-2"
                            >
                              <FaBan size={18} className="text-red-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <button
          onClick={() => {
            const newPage = Math.max(page - 1, 0);
            setPage(newPage);
            navigate(`?page=${newPage}`);
          }}
          disabled={page === 0}
          className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Trang {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            navigate(`?page=${newPage}`);
          }}
          disabled={page + 1 >= totalPages} // Disable nếu đã ở trang cuối
          className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <Loading isLoading={isLoading} />
    </div>
  );
};

export default ListEvents;
