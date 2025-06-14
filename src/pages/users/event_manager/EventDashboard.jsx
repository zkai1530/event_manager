import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaList,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { getEventInfoById } from "services/user/eventService";
import { FormatPrice } from "utils/formatPrice";

const EventDashboard = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const currentDate = new Date();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventInfoById(eventId);
        setEventData(data);
        if (data.schedules && data.schedules.length > 0) {
          const uniqueDates = getUniqueDates(data.schedules);
          setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Lấy danh sách ngày duy nhất từ schedules và sắp xếp
  const getUniqueDates = (schedules) => {
    if (!schedules || schedules.length === 0) return [];
    const dates = [
      ...new Set(schedules.map((schedule) => schedule.scheduleDate)),
    ];
    const today = currentDate.toISOString().split("T")[0];
    const futureDates = dates
      .filter((date) => new Date(date) >= new Date(today))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const pastDates = dates
      .filter((date) => new Date(date) < new Date(today))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return [...futureDates, ...pastDates];
  };

  // Lọc khung giờ theo ngày được chọn
  const getSchedulesForDate = (date) => {
    if (!eventData || !eventData.schedules) return [];
    return eventData.schedules.filter(
      (schedule) => schedule.scheduleDate === date,
    );
  };

  // Tính toán thông tin cho bảng
  const getTableData = (schedules) => {
    return schedules.map((schedule) => {
      const startTime = schedule.startTime.slice(0, 5);
      const endTime = schedule.endTime.slice(0, 5);
      const duration = calculateDuration(startTime, endTime);
      const ticketSchedules = schedule.ticketSchedules || [];

      // Số lượng loại vé (số lượng ticketSchedules)
      const visibleTickets = ticketSchedules.length;

      // Tổng số vé đã bán
      const ticketsSold = ticketSchedules.reduce(
        (sum, ticket) => sum + (ticket.sold || 0),
        0,
      );

      // Tổng số vé phát hành (tổng availableQuantity + ticketsSold)
      const totalTicketsIssued = ticketSchedules.reduce(
        (sum, ticket) =>
          sum + (ticket.availableQuantity || 0),
        0,
      );

      const prices = ticketSchedules
        .map((ticket) => ticket.price)
        .filter((price) => price != null);
      const priceRange =
        prices.length > 0
          ? `${FormatPrice(Math.min(...prices))} - ${FormatPrice(Math.max(...prices))}`
          : "N/A";

      return {
        timeSlot: `${startTime} - ${endTime} (${duration})`,
        visibleTickets,
        ticketsSold,
        totalTicketsIssued, 
        priceRange,
      };
    });
  };

  // Tính duration giữa startTime và endTime
  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = new Date(2025, 0, 1, startHour, startMinute);
    const end = new Date(2025, 0, 1, endHour, endMinute);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  };

  // Lấy danh sách ngày để hiển thị trong Swiper
  const getDaysToDisplay = () => {
    const uniqueDates = getUniqueDates(eventData?.schedules || []);
    return uniqueDates.map((date) => {
      const d = new Date(date);
      return {
        date,
        dayOfWeek: d
          .toLocaleString("vi-VN", { weekday: "narrow" })
          .toUpperCase(),
        dayOfMonth: d.getDate(),
        month: d.toLocaleString("vi-VN", { month: "long" }).toUpperCase(),
        isAvailable: true,
      };
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleSwiperEvents = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const breakpointsResponsive = {
    "@0.00": { slidesPerView: 1, spaceBetween: 10 },
    "@0.75": { slidesPerView: 2, spaceBetween: 20 },
    "@1.00": { slidesPerView: 3, spaceBetween: 10 },
    "@1.50": { slidesPerView: 8, spaceBetween: 1 },
  };

  if (!eventData) return <div>Loading...</div>;

  const daysToDisplay = getDaysToDisplay();
  const selectedSchedules = getSchedulesForDate(selectedDate);
  const tableData = getTableData(selectedSchedules);
  const allPast = daysToDisplay.every((day) => {
    const schedulesForDay = eventData.schedules.filter(
      (schedule) => schedule.scheduleDate === day.date,
    );
    return schedulesForDay.every((schedule) => {
      const endDateTime = new Date(
        `${schedule.scheduleDate}T${schedule.endTime}`,
      );
      return endDateTime < currentDate;
    });
  });

  return (
    <div className="p-4">
      <h1 className="text-main font-logo mb-4 text-5xl font-bold">
        Event overview
      </h1>
      <h2 className="mb-6 text-2xl font-semibold">
        {eventData.name}
        <span className="text-red-400 text-xl">{allPast && " (Đã kết thúc)"}</span>
      </h2>

      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaCalendar className="mr-2" />
          {/* <span className="font-semibold">
            {currentDate
              .toLocaleString("vi-VN", { month: "long", year: "numeric" })
              .toUpperCase()}
          </span> */}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <button
              className={`custom-prev bg-main hover:bg-main-bold z-10 rounded-full p-[6px] text-neutral-50 ${isBeginning ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              disabled={isBeginning}
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              className={`custom-next bg-main hover:bg-main-bold z-10 rounded-full p-[6px] text-neutral-50 ${isEnd ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              disabled={isEnd}
            >
              <FaChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of the Week with Swiper */}
      <Swiper
        slidesPerView={2}
        spaceBetween={5}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        breakpoints={breakpointsResponsive}
        onSlideChange={handleSwiperEvents}
        onInit={handleSwiperEvents}
        modules={[Navigation]}
        className="mySwiper"
      >
        {daysToDisplay.map((day) => (
          <SwiperSlide key={day.date} className="flex justify-center">
            <button
              onClick={() => handleDateClick(day.date)}
              className={`w-24 rounded border p-3 text-center ${
                day.date === selectedDate
                  ? "border-blue-600 bg-blue-50"
                  : day.isAvailable
                    ? "border-gray-300 bg-white"
                    : "border-gray-200 bg-gray-100 text-gray-400"
              }`}
              disabled={!day.isAvailable}
            >
              <div className="mb-1 text-sm">{day.dayOfWeek}</div>
              <div className="text-lg font-semibold">{day.dayOfMonth}</div>
              <div className="mt-1 text-xs">{day.month}</div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Schedule Table */}
      <div className="mt-5 flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="inline-block min-w-full p-1.5 align-middle">
            <div className="overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary1">
                  <tr>
                    <th
                      scope="col"
                      className="w-[30%] px-6 py-3 text-start text-xs font-medium text-white uppercase"
                    >
                      Khung thời gian
                    </th>
                    <th
                      scope="col"
                      className="w-[20%] px-6 py-3 text-center text-xs font-medium text-white uppercase"
                    >
                      Tổng vé
                    </th>
                    <th
                      scope="col"
                      className="w-[20%] px-6 py-3 text-center text-xs font-medium text-white uppercase"
                    >
                      Lượt bán
                    </th>
                    <th
                      scope="col"
                      className="w-[30%] px-6 py-3 text-end text-xs font-medium text-white uppercase"
                    >
                      Giá vé
                    </th>
                  </tr>
                </thead>
                <tbody className="cursor-pointer divide-y divide-gray-200">
                  {tableData.map((row, index) => {
                    const schedule = selectedSchedules[index];
                    return (
                      <tr
                        key={index}
                        className="transition-shadow hover:relative hover:shadow-md"
                        onClick={() =>
                          navigate(
                            `/manage/event/${eventId}/schedule/${schedule.scheduleId}`,
                          )
                        }
                      >
                        <td className="px-4 py-3">{row.timeSlot}</td>
                        <td className="px-4 py-3 text-center">
                          {row.visibleTickets} {/* Số loại vé */}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.ticketsSold}/{row.totalTicketsIssued}{" "}
                          {/* Tổng bán / Tổng phát hành */}
                        </td>
                        <td className="px-4 py-3 text-end font-medium whitespace-nowrap">
                          {row.priceRange}
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
    </div>
  );
};

export default EventDashboard;
