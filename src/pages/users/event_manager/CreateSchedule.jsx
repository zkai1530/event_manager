import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useForm } from "react-hook-form";
import {
  format,
  parse,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  isSameWeek,
  isSameMonth,
  differenceInMinutes,
} from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { getEventInfoById } from "services/user/eventService";
import { useParams } from "react-router-dom";
import {
  createSchedules,
  deleteSchedule,
} from "services/user/schedulesService";
import { FormatPrice } from "utils/formatPrice";
import Swal from "sweetalert2";
import Loading from "@/components/ui/Loading";

const CreateSchedule = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recurrence, setRecurrence] = useState("once");
  const [timeType, setTimeType] = useState("single");
  const [selectedDays, setSelectedDays] = useState([]);
  const [activeMonth, setActiveMonth] = useState(new Date());
  const [timeRanges, setTimeRanges] = useState([
    { id: Date.now(), startTime: "", endTime: "" },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    getValues,
    setValue,
  } = useForm();

  const { eventId } = useParams();
  const token = localStorage.getItem("token");
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [eventType, setEventType] = useState("");
  const [hoveredScheduleId, setHoveredScheduleId] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getEventInfoById(eventId)
      .then((data) => {
        console.log("tui ne", data);

        if (!data.schedules || data.schedules.length === 0) {
          setIsReady(false);
          setIsLoading(false);
          return;
        }

        // Xử lý schedules để thêm dayOfWeek và duration
        const processedSchedules = data.schedules.map((schedule) => {
          const date = parse(schedule.scheduleDate, "yyyy-MM-dd", new Date());
          const start = parse(schedule.startTime, "HH:mm:ss", new Date());
          const end = parse(schedule.endTime, "HH:mm:ss", new Date());
          const duration = differenceInMinutes(end, start) / 60;

          return {
            scheduleId: schedule.scheduleId,
            scheduleDate: schedule.scheduleDate,
            dayOfWeek: format(date, "EEEE", { locale: enUS }), // Thứ (tiếng Việt)
            startTime: schedule.startTime.slice(0, 5), // Cắt bỏ giây (10:00)
            endTime: schedule.endTime.slice(0, 5), // Cắt bỏ giây (11:00)
            duration: duration.toFixed(1), // Làm tròn 1 chữ số (1.0h)
            tickets: schedule.ticketSchedules.map((ticket) => ({
              id: ticket.id,
              name: ticket.name,
              price: ticket.price,
              availableQuantity: ticket.availableQuantity,
              description: ticket.description,
              saleStart: ticket.saleStart,
              saleEnd: ticket.saleEnd,
            })),
          };
        });

        console.log("Processed Schedules:", processedSchedules);
        setSchedules(processedSchedules);
        setEventType(data.eventType);
        setIsReady(true);
      })
      .catch((err) => {
        console.log("getEventInfoById", err);
        setIsReady(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [eventId, setValue, setEventType]);

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2)
      .toString()
      .padStart(2, "0");
    const minutes = (i % 2 === 0 ? "00" : "30").padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const addTimeRange = () => {
    setTimeRanges((prev) => [
      ...prev,
      { id: Date.now(), startTime: "", endTime: "" },
    ]);
  };

  const removeTimeRange = (id) => {
    setTimeRanges((prev) => prev.filter((range) => range.id !== id));
  };

  const calculateDates = (startDate, endDate, recurrence, selectedDays) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    let dates = [];

    if (recurrence === "once") {
      dates = [start];
    } else if (recurrence === "daily") {
      dates = eachDayOfInterval({ start, end });
    } else if (recurrence === "weekly") {
      dates = eachDayOfInterval({ start, end }).filter((date) =>
        selectedDays.includes(date.getDay()),
      );
    } else if (recurrence === "monthly") {
      dates = eachDayOfInterval({ start, end }).filter(
        (date) => isSameDay(date, start) || date.getDate() === start.getDate(),
      );
    }

    return dates.map((date) => format(date, "yyyy-MM-dd"));
  };

  const onSubmit = async (data) => {
    const { startDate, endDate, singleStartTime, singleEndTime } = data;
    const dates = calculateDates(startDate, endDate, recurrence, selectedDays);

    let times = [];
    if (timeType === "single") {
      times = [{ startTime: singleStartTime, endTime: singleEndTime }];
    } else {
      times = timeRanges.map((range) => ({
        startTime: range.startTime,
        endTime: range.endTime,
      }));
    }

    const schedules = [];
    dates.forEach((date) => {
      times.forEach((time) => {
        schedules.push({
          scheduleDate: date,
          startTime: time.startTime,
          endTime: time.endTime,
        });
      });
    });

    const result = { schedules };

    console.log("Schedule submitted:", result);
    clearErrors();

    try {
      setIsLoading(true);
      const data = await createSchedules(eventId, result, token);
      console.log("thu", data.message);
      if (data.message === "Create schedule was successfully!") {
        Swal.fire({
          title: "Thêm lịch trình thành công!",
          text: `Lịch trình của bạn đã được thêm!.`,
          icon: "success",
        }).then(() => {
          window.location.reload();
        });

        // Gọi lại getEventInfoById để cập nhật danh sách schedules
        const updatedData = await getEventInfoById(eventId);
        const processedSchedules = updatedData.schedules.map((schedule) => {
          const date = parse(schedule.scheduleDate, "yyyy-MM-dd", new Date());
          const start = parse(schedule.startTime, "HH:mm:ss", new Date());
          const end = parse(schedule.endTime, "HH:mm:ss", new Date());
          const duration = differenceInMinutes(end, start) / 60;

          return {
            scheduleId: schedule.scheduleId,
            scheduleDate: schedule.scheduleDate,
            dayOfWeek: format(date, "EEEE", { locale: enUS }),
            startTime: schedule.startTime.slice(0, 5),
            endTime: schedule.endTime.slice(0, 5),
            duration: duration.toFixed(1),
            tickets: schedule.ticketSchedules.map((ticket) => ({
              id: ticket.id,
              name: ticket.name,
              price: ticket.price,
              availableQuantity: ticket.availableQuantity,
              description: ticket.description,
              saleStart: ticket.saleStart,
              saleEnd: ticket.saleEnd,
            })),
          };
        });

        setSchedules(processedSchedules);
        setEventType(updatedData.eventType);
        setIsReady(true);
        setIsOpen(false); // Đóng form sau khi thêm thành công
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: `Thêm lịch trình không thành công!.`,
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Create/Update schedules error", error);
      if (error.message === "Schedule conflict detected!") {
        Swal.fire({
          title: "Lịch trình bạn thêm đã bị trùng!",
          text: `Thêm lịch trình không thành công!.`,
          icon: "error",
        });
      } else if (error.message === "Event is already published!") {
        Swal.fire({
          title: "Sự kiện đã được xuất bản!",
          text: `Không thể thêm/chỉnh sửa lịch trình!`,
          icon: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          await deleteSchedule(scheduleId, token);
          Swal.fire({
            title: "Xóa thành công!",
            text: "Lịch trình đã được xóa.",
            icon: "success",
          });

          // để cập nhật danh sách schedules
          const updatedData = await getEventInfoById(eventId);
          const processedSchedules = updatedData.schedules.map((schedule) => {
            const date = parse(schedule.scheduleDate, "yyyy-MM-dd", new Date());
            const start = parse(schedule.startTime, "HH:mm:ss", new Date());
            const end = parse(schedule.endTime, "HH:mm:ss", new Date());
            const duration = differenceInMinutes(end, start) / 60;

            return {
              scheduleId: schedule.scheduleId,
              scheduleDate: schedule.scheduleDate,
              dayOfWeek: format(date, "EEEE", { locale: enUS }),
              startTime: schedule.startTime.slice(0, 5),
              endTime: schedule.endTime.slice(0, 5),
              duration: duration.toFixed(1),
              tickets: schedule.ticketSchedules.map((ticket) => ({
                id: ticket.id,
                name: ticket.name,
                price: ticket.price,
                availableQuantity: ticket.availableQuantity,
                description: ticket.description,
                saleStart: ticket.saleStart,
                saleEnd: ticket.saleEnd,
              })),
            };
          });

          setSchedules(processedSchedules);
          setEventType(updatedData.eventType);
          setIsReady(updatedData.schedules.length > 0);
          setExpandedSchedules({}); // Đóng tất cả các lịch trình đang mở
          setSelectedDate(null); // Bỏ chọn ngày trên lịch
        } catch (error) {
          console.error("deleteSchedule ", error);
          if (error.response.data?.message === "Event is already published!") {
            Swal.fire({
              title: "Sự kiện đã được xuất bản!",
              text: `Không thể xoá lịch trình!`,
              icon: "error",
            });
          } else if (
            error.response.data?.data.includes(
              "This schedule has already been purchased for ticket name",
            )
          ) {
            const message = error.response.data.data;

            // Dùng regex để lấy ngày và giờ
            const ticketNameMatch = message.match(/ticket name: (.+)$/);
            const ticketName = ticketNameMatch?.[1]?.trim();

            let msg = "Xoá lịch trình không thành công!";
            if (ticketNameMatch) {
              msg = `Không thể xoá vì đã có người dùng mua vé "${ticketName}" của lịch trình này `;
            }

            Swal.fire({
              title: "Lỗi!",
              text: msg,
              icon: "error",
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Xóa lịch trình không thành công.",
              icon: "error",
            });
          }
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleDateChange = (date) => {
    // Kiểm tra xem ngày được click có đang active không
    if (isSameDay(date, selectedDate)) {
      return; // Không làm gì nếu ngày đã active
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Kiểm tra xem ngày được click có trong schedules không
    const existingSchedule = schedules.find(
      (schedule) => schedule.scheduleDate === formattedDate,
    );

    if (existingSchedule) {
      // Nếu ngày đã có trong schedules
      expandSchedule(existingSchedule.scheduleId);

      // Cuộn đến lịch trình trong danh sách
      const scheduleElement = document.getElementById(
        `schedule-${existingSchedule.scheduleId}`,
      );
      if (scheduleElement) {
        scheduleElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Nếu ngày chưa có trong schedules, mở form như cũ
      setValue("startDate", formattedDate); // Set startDate
      setValue("endDate", "");
      setValue("singleStartTime", "");
      setValue("singleEndTime", "");
      setRecurrence("once");
      timeRanges.forEach((_, index) => {
        setValue(`timeRanges[${index}].startTime`, "");
        setValue(`timeRanges[${index}].endTime`, "");
      });
      setTimeRanges([{ id: Date.now(), startTime: "", endTime: "" }]);
      clearErrors();
      setIsOpen(true);
    }

    setSelectedDate(date);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const dateString = format(date, "yyyy-MM-dd");
    const hasSchedule = schedules.some(
      (schedule) => schedule.scheduleDate === dateString,
    );

    // Tìm schedule tương ứng với hoveredScheduleId
    const hoveredSchedule = hoveredScheduleId
      ? schedules.find((schedule) => schedule.scheduleId === hoveredScheduleId)
      : null;

    // Kiểm tra xem ngày này có phải ngày đang hover không
    const isHoveredDate =
      hoveredSchedule && hoveredSchedule.scheduleDate === dateString;

    if (isHoveredDate) {
      return "react-calendar__tile--hasSchedule react-calendar__tile--active";
    }
    return hasSchedule ? "react-calendar__tile--hasSchedule" : null;
  };

  const [expandedSchedules, setExpandedSchedules] = useState({});

  const expandSchedule = (scheduleId) => {
    setExpandedSchedules((prev) => {
      // Nếu ngày đã mở rồi, không làm gì
      if (prev[scheduleId]) {
        return prev;
      }

      // Đóng tất cả các ngày khác, mở ngày được click
      const newExpanded = {};
      newExpanded[scheduleId] = true;
      return newExpanded;
    });
  };

  // Hàm mở/đóng khi click vào div trong danh sách
  const toggleSchedule = (scheduleId) => {
    setExpandedSchedules((prev) => {
      // Nếu ngày đã mở, đóng nó
      if (prev[scheduleId]) {
        const schedule = schedules.find((s) => s.scheduleId === scheduleId);
        if (schedule) {
          const scheduleDate = parse(
            schedule.scheduleDate,
            "yyyy-MM-dd",
            new Date(),
          );
          // Nếu ngày đang active, bỏ active
          if (isSameDay(selectedDate, scheduleDate)) {
            setSelectedDate(null);
          }
        }
        return {}; // Đóng ngày được click
      }

      // Nếu ngày chưa mở, đóng tất cả ngày khác và mở ngày này
      const newExpanded = {};
      newExpanded[scheduleId] = true;

      // Cập nhật selectedDate và activeMonth để làm ngày active trên lịch và chuyển tháng
      const schedule = schedules.find((s) => s.scheduleId === scheduleId);
      if (schedule) {
        const scheduleDate = parse(
          schedule.scheduleDate,
          "yyyy-MM-dd",
          new Date(),
        );
        setSelectedDate(scheduleDate);
        setActiveMonth(scheduleDate); // Thêm: Cập nhật tháng hiển thị trên lịch
      }

      return newExpanded;
    });
  };

  return (
    <div className="px-2">
      <div>
        <div className="mb-4 flex justify-between">
          <h2 className="font-main py-1 text-3xl font-bold">
            Lịch trình của sự kiện
          </h2>
          <div className="mb-4 flex items-center justify-between">
            <button
              className={`bg-main hover:bg-main-bold cursor-pointer rounded-lg px-4 py-2 text-xl font-medium text-white transition-colors`}
              onClick={() => {
                setValue("startDate", "");
                setValue("endDate", "");
                setValue("singleStartTime", "");
                setValue("singleEndTime", "");
                setRecurrence("once");
                timeRanges.forEach((_, index) => {
                  setValue(`timeRanges[${index}].startTime`, "");
                  setValue(`timeRanges[${index}].endTime`, "");
                });
                setTimeRanges([{ id: Date.now(), startTime: "", endTime: "" }]);
                clearErrors();
                setTimeRanges([{ id: Date.now(), startTime: "", endTime: "" }]);
                setIsOpen(true);
              }}
            >
              Tạo mới lịch trình
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Calendar */}
          <div className="w-1/3">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={tileClassName}
              activeStartDate={activeMonth}
              className="border-none"
              locale="en-US"
            />
          </div>

          {/* List schedules */}
          {isReady && schedules.length > 0 && (
            <div className="max-h-[420px] w-2/3 overflow-y-auto px-4 py-[2px]">
              <div className="space-y-4">
                {(() => {
                  // Nhóm schedules theo scheduleDate
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const groupedSchedules = schedules.reduce((acc, schedule) => {
                    const scheduleDate = new Date(schedule.scheduleDate);
                    scheduleDate.setHours(0, 0, 0, 0);

                    if (scheduleDate >= today) {
                      const date = schedule.scheduleDate;
                      if (!acc[date]) {
                        acc[date] = [];
                      }
                      acc[date].push(schedule);
                    }

                    return acc;
                  }, {});

                  // Sắp xếp các ngày từ gần đến xa
                  const sortedDates = Object.entries(groupedSchedules).sort(
                    (a, b) => {
                      const dateA = new Date(a[0]).getTime();
                      const dateB = new Date(b[0]).getTime();
                      return dateA - dateB;
                    },
                  );

                  // Chuyển thành mảng các ngày để render
                  return sortedDates.map(([date, schedulesForDate]) => {
                    // Lấy schedule đầu tiên để hiển thị thông tin ngày
                    const firstSchedule = schedulesForDate[0];
                    // Tính giá min-max và số lượng vé cho toàn bộ schedules trong ngày
                    const allTickets = schedulesForDate.flatMap(
                      (s) => s.tickets || [],
                    );
                    const minPrice =
                      allTickets.length > 0
                        ? Math.min(...allTickets.map((t) => t.price || 0))
                        : 0;
                    const maxPrice =
                      allTickets.length > 0
                        ? Math.max(...allTickets.map((t) => t.price || 0))
                        : 0;
                    const totalSlots = schedulesForDate.length;

                    return (
                      <div
                        key={date}
                        id={`schedule-${firstSchedule.scheduleId}`}
                        className={`cursor-pointer rounded-lg border border-gray-300 px-4 py-3 transition-all duration-200 ${
                          hoveredScheduleId === firstSchedule.scheduleId
                            ? "ring-main ring-2"
                            : ""
                        }`}
                        onMouseEnter={() =>
                          setHoveredScheduleId(firstSchedule.scheduleId)
                        }
                        onMouseLeave={() => setHoveredScheduleId(null)}
                        onClick={() => toggleSchedule(firstSchedule.scheduleId)}
                      >
                        <div className="relative cursor-pointer">
                          {/* arrow */}
                          <div className="absolute top-1/2 right-0 -translate-y-1/2">
                            <svg
                              className={`h-5 w-5 transition-transform duration-200 ${
                                expandedSchedules[firstSchedule.scheduleId]
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>

                          {/* column 1 */}
                          <div className="flex space-x-5">
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-lg font-medium text-red-500">
                                {firstSchedule.dayOfWeek
                                  ?.slice(0, 3)
                                  .toUpperCase() || "N/A"}
                              </div>

                              <div className="text-lg font-medium text-gray-800">
                                {format(
                                  parse(
                                    firstSchedule.scheduleDate,
                                    "yyyy-MM-dd",
                                    new Date(),
                                  ),
                                  "d",
                                )}
                              </div>
                            </div>

                            {/* column 2 */}
                            <div className="flex flex-col justify-center">
                              <div className="flex space-x-3">
                                <span className="text-md font-medium text-gray-800">
                                  {format(
                                    parse(
                                      firstSchedule.scheduleDate,
                                      "yyyy-MM-dd",
                                      new Date(),
                                    ),
                                    "M/yyyy",
                                  )}
                                </span>
                                <span className="text-md text-gray-600">
                                  {totalSlots} ca
                                </span>
                              </div>

                              <div className="flex space-x-2">
                                {/* <button className="mt-1 cursor-pointer font-medium text-blue-600">
                                  Sửa thông tin
                                </button> */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSchedule(
                                      firstSchedule.scheduleId,
                                    );
                                  }}
                                  className="mt-1 cursor-pointer font-medium text-red-600"
                                >
                                  Xoá lịch trình
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Phần chi tiết (toggle) */}
                        {expandedSchedules[firstSchedule.scheduleId] && (
                          <div className="mt-2">
                            <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="font-medium">Khung giờ</div>
                              <div className="font-medium">Kéo dài</div>
                              <div className="font-medium">Vé </div>
                              <div className="font-medium">Giá vé</div>
                              {schedulesForDate.map((schedule) => {
                                const tickets = schedule.tickets || [];
                                const minPriceForSchedule =
                                  tickets.length > 0
                                    ? Math.min(
                                        ...tickets.map((t) => t.price || 0),
                                      )
                                    : 0;
                                const maxPriceForSchedule =
                                  tickets.length > 0
                                    ? Math.max(
                                        ...tickets.map((t) => t.price || 0),
                                      )
                                    : 0;
                                const duration =
                                  Math.abs(
                                    new Date(
                                      `${schedule.scheduleDate}T${schedule.endTime}`,
                                    ).getTime() -
                                      new Date(
                                        `${schedule.scheduleDate}T${schedule.startTime}`,
                                      ).getTime(),
                                  ) / 3600000;

                                return (
                                  <>
                                    <div>{schedule.startTime}</div>
                                    <div>
                                      {isNaN(duration)
                                        ? "N/A"
                                        : `${duration.toFixed(1)}h`}
                                    </div>
                                    <div>{tickets.length}</div>
                                    <div>
                                      {FormatPrice(minPriceForSchedule)}-
                                      {FormatPrice(maxPriceForSchedule)}
                                    </div>
                                  </>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* create schedules form */}
      <div
        className={`fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-110 bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-xl" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="bg-main flex items-center justify-between border-b border-gray-200 px-6 py-3">
          <h2 className="text-xl font-semibold text-white">
            Tạo lịch trình mới
          </h2>
          <button
            onClick={() => {
              setIsOpen(false);
              clearErrors();
            }}
            className="text-white transition-colors hover:text-gray-200"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-3"
          >
            {/* Start Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                {...register("startDate", {
                  required: "Ngày bắt đầu là bắt buộc",
                  validate: (value) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selectedDate = new Date(value);
                    return (
                      selectedDate >= today ||
                      "Ngày bắt đầu phải từ hôm nay trở đi"
                    );
                  },
                })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 text-sm outline-none ${
                  errors.startDate
                    ? "border-2 border-red-500"
                    : "focus:ring-main focus:border-none focus:ring-2"
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.startDate.message === "string"
                    ? errors.startDate.message
                    : "Error!"}
                </p>
              )}
            </div>

            {/* Recurrence */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Tần suất
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="focus:ring-main w-full rounded-lg border border-gray-500 px-4 py-2 outline-none focus:border-none focus:ring-2"
              >
                <option value="once">Một lần</option>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>

            {/* Weekly Days */}
            {recurrence === "weekly" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Chọn ngày trong tuần
                </label>
                <div className="flex space-x-2">
                  {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(
                    (day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`rounded-lg px-3 py-1 text-sm font-medium ${
                          selectedDays.includes(index)
                            ? "bg-main text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {day}
                      </button>
                    ),
                  )}
                </div>
                {recurrence === "weekly" && selectedDays.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    Vui lòng chọn ít nhất một ngày
                  </p>
                )}
              </div>
            )}

            {/* End Date */}
            {(recurrence === "daily" ||
              recurrence === "weekly" ||
              recurrence === "monthly") && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  {...register("endDate", {
                    required: "Ngày kết thúc là bắt buộc",
                    validate: (value) => {
                      const startDate = new Date(getValues("startDate"));
                      const endDate = new Date(value);
                      return (
                        endDate >= startDate ||
                        "Ngày kết thúc phải sau ngày bắt đầu"
                      );
                    },
                  })}
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 text-sm outline-none ${
                    errors.endDate
                      ? "border-2 border-red-500"
                      : "focus:ring-main focus:border-none focus:ring-2"
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.endDate.message === "string"
                      ? errors.endDate.message
                      : "Error!"}
                  </p>
                )}
              </div>
            )}

            {/* Time Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Loại giờ
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setTimeType("single")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    timeType === "single"
                      ? "bg-main text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Một khung giờ
                </button>
                <button
                  type="button"
                  onClick={() => setTimeType("multiple")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    timeType === "multiple"
                      ? "bg-main text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Nhiều khung giờ
                </button>
              </div>
            </div>

            {/* Single Time */}
            {timeType === "single" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Khoảng giờ
                </label>
                <div className="flex items-center space-x-3">
                  <select
                    {...register("singleStartTime", {
                      required: "Giờ bắt đầu là bắt buộc",
                    })}
                    className={`custom-select max-h-10 w-1/2 overflow-y-auto rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                      errors.singleStartTime
                        ? "border-2 border-red-500"
                        : "focus:ring-main focus:border-none focus:ring-2"
                    }`}
                  >
                    <option value="">Chọn giờ bắt đầu</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <select
                    {...register("singleEndTime", {
                      required: "Giờ kết thúc là bắt buộc",
                      validate: (value) => {
                        const startTime = getValues("singleStartTime");
                        return (
                          value > startTime ||
                          "Giờ kết thúc phải sau giờ bắt đầu"
                        );
                      },
                    })}
                    className={`max-h-10 w-1/2 overflow-y-auto rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                      errors.singleEndTime
                        ? "border-2 border-red-500"
                        : "focus:ring-main focus:border-none focus:ring-2"
                    }`}
                  >
                    <option value="">Chọn giờ kết thúc</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                {(errors.singleStartTime || errors.singleEndTime) && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.singleStartTime?.message === "string"
                      ? errors.singleStartTime.message
                      : typeof errors.singleEndTime?.message === "string"
                        ? errors.singleEndTime.message
                        : "Vui lòng nhập đầy đủ khoảng giờ"}
                  </p>
                )}
              </div>
            )}

            {/* Multiple Time */}
            {timeType === "multiple" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Khoảng giờ
                </label>
                {timeRanges.map((range, index) => (
                  <div
                    key={range.id}
                    className="mb-2 flex items-center space-x-3"
                  >
                    <select
                      {...register(`timeRanges[${index}].startTime`, {
                        required: "Giờ bắt đầu là bắt buộc",
                      })}
                      defaultValue={range.startTime}
                      onChange={(e) => {
                        const newRanges = [...timeRanges];
                        newRanges[index].startTime = e.target.value;
                        setTimeRanges(newRanges);
                      }}
                      className={`max-h-20 w-1/2 overflow-y-auto rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                        errors.timeRanges?.[index]?.startTime
                          ? "border-2 border-red-500"
                          : "focus:ring-main focus:border-none focus:ring-2"
                      }`}
                    >
                      <option value="">Chọn giờ bắt đầu</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <select
                      {...register(`timeRanges[${index}].endTime`, {
                        required: "Giờ kết thúc là bắt buộc",
                        validate: (value) => {
                          const startTime = getValues(
                            `timeRanges[${index}].startTime`,
                          );
                          return (
                            value > startTime ||
                            "Giờ kết thúc phải sau giờ bắt đầu"
                          );
                        },
                      })}
                      defaultValue={range.endTime}
                      onChange={(e) => {
                        const newRanges = [...timeRanges];
                        newRanges[index].endTime = e.target.value;
                        setTimeRanges(newRanges);
                      }}
                      className={`max-h-20 w-1/2 overflow-y-auto rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                        errors.timeRanges?.[index]?.endTime
                          ? "border-2 border-red-500"
                          : "focus:ring-main focus:border-none focus:ring-2"
                      }`}
                    >
                      <option value="">Chọn giờ kết thúc</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {/* Chỉ hiển thị nút thùng rác khi có từ 2 khoảng giờ trở lên */}
                    {timeRanges.length >= 2 && (
                      <button
                        type="button"
                        onClick={() => removeTimeRange(range.id)}
                        className="group bg-emphasis relative flex h-[28px] w-[32px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-none font-semibold shadow-[0_0_10px_rgba(0,0,0,0.12)] transition-all duration-300 hover:w-[80px] hover:rounded-full hover:bg-red-500"
                      >
                        <span className="absolute top-[-14px] text-[1px] text-white opacity-0 transition-all duration-300 group-hover:translate-y-[18px] group-hover:text-[10px] group-hover:opacity-100">
                          Xoá
                        </span>
                        <svg
                          viewBox="0 0 448 512"
                          className="w-[10px] transition-all duration-300 group-hover:w-[28px] group-hover:translate-y-[50%]"
                        >
                          <path
                            fill="white"
                            d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {errors.timeRanges?.[0] && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.timeRanges?.[0]?.startTime?.message ===
                    "string"
                      ? errors.timeRanges[0].startTime.message
                      : typeof errors.timeRanges?.[0]?.endTime?.message ===
                          "string"
                        ? errors.timeRanges[0].endTime.message
                        : "Vui lòng nhập đầy đủ khoảng giờ"}
                  </p>
                )}
                <button
                  type="button"
                  onClick={addTimeRange}
                  className="bg-main hover:bg-main-bold mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                >
                  Thêm khoảng giờ
                </button>
              </div>
            )}

            <button
              type="submit"
              className="bg-main hover:bg-main-bold mt-4 rounded-lg py-2 font-medium text-white transition-colors"
            >
              Lưu
            </button>
          </form>
        </div>
      </div>
      <Loading isLoading={isLoading} />
    </div>
  );
};

export default CreateSchedule;
