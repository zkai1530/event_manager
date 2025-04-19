import ScheduleModal from "components/modal/ScheduleModal";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { IoEllipsisVertical, IoTicketOutline } from "react-icons/io5";
import { getEventInfoById } from "services/user/eventService";
import { createTicket, updateTicket } from "services/user/ticketService";
import { formatDateTime } from "utils/formatSchedule";
import { useEventRoute } from "utils/useEventRoute";

const CreateTicket = () => {
  const { eventId, section } = useEventRoute();
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    getValues,
    trigger,
    setValue,
    control,
  } = useForm({ mode: "onBlur" });

  const [selectedOption, setSelectedOption] = useState("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleIds, setScheduleIds] = useState([]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const onSubmit = async (data) => {
    const currentTicket = tickets.find((ticket) => ticket.id === data.id);
    const requestData = {
      ...data,
      scheduleIds:
        eventType === "single"
          ? tickets[0]?.schedules.map((s) => s.scheduleId) || []
          : selectedOption === "all" && currentTicket
            ? currentTicket.schedules.map((schedule) => schedule.scheduleId)
            : scheduleIds,
    };

    console.log("Dữ liệu gửi đi:", requestData);

    try {
      setIsLoading(true);
      if (requestData.id) {
        await updateTicket(requestData.id, requestData, token);
      } else {
        console.log(requestData);
        const eventId = await createTicket(requestData, token);
        console.log(eventId);
      }
    } catch (error) {
      console.error("Create/Update ticket error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState([]);

  const handleTicketSelect = (ticket) => {
    setValue("id", ticket.id);
    setValue("name", ticket.name);
    setValue("description", ticket.description);
    setValue("price", ticket.price.toString());
    setValue("availableQuantity", ticket.availableQuantity.toString());

   const formatDateTime = (dateTime) => {
     const date = new Date(dateTime);
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, "0");
     const day = String(date.getDate()).padStart(2, "0");
     const hours = String(date.getHours()).padStart(2, "0");
     const minutes = String(date.getMinutes()).padStart(2, "0");
     return `${year}-${month}-${day}T${hours}:${minutes}`;
   };
   setValue("saleStart", formatDateTime(ticket.saleStart)); // Sửa tên trường
   setValue("saleEnd", formatDateTime(ticket.saleEnd));

    setScheduleIds(ticket.scheduleIds || []);
    // setSelectedOption(
    //   eventType === "single" || ticket.scheduleIds?.length === 0
    //     ? "all"
    //     : "certain",
    // );
    setSelectedOption(
      eventType === "SINGLE" ||
        ticket.scheduleIds?.length === 0 ||
        (ticket.scheduleIds?.length === ticket.schedules.length &&
          ticket.scheduleIds?.every((id) =>
            ticket.schedules.some((schedule) => schedule.scheduleId === id),
          ) &&
          ticket.schedules.every((schedule) =>
            ticket.scheduleIds?.includes(schedule.scheduleId),
          ))
        ? "all"
        : "certain",
    );
  };

  const [eventType, setEventType] = useState("SINGLE");
  useEffect(() => {
    setIsLoading(true);
    getEventInfoById(eventId, token)
      .then((data) => {
        console.log("tui ne", data);
        if (!data.schedules || data.schedules.length === 0) {
          setIsReady(false);
          setIsLoading(false);
          return;
        }

        // Lấy tất cả schedules từ API
        const allSchedules = data.schedules.map((schedule) => ({
          scheduleId: schedule.scheduleId,
          scheduleDate: schedule.scheduleDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        }));

        // Gộp tickets và gán scheduleIds
        const mergedTickets = data.schedules.reduce((acc, schedule) => {
          schedule.ticketSchedules.forEach((ticket) => {
            const existingTicket = acc.find((t) => t.id === ticket.id);

            if (existingTicket) {
              if (data.eventType !== "SINGLE") {
                existingTicket.scheduleIds.push(schedule.scheduleId);
              }
            } else {
              acc.push({
                id: ticket.id,
                name: ticket.name,
                description: ticket.description,
                sold: ticket.sold,
                price: ticket.price,
                availableQuantity: ticket.availableQuantity,
                saleStart: ticket.saleStart,
                saleEnd: ticket.saleEnd,
                schedules: [...allSchedules],
                scheduleIds: [schedule.scheduleId],
              });
            }
          });
          return acc;
        }, []);

        console.log("merge", mergedTickets);
        setTickets(mergedTickets);
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
  }, [eventId, setValue, setEventType, token]);

  // Click outside for close create ticket form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        clearErrors();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, clearErrors]);

  return (
    <div className="px-2">
      <div className="text-right">
        <button
          onClick={() => {
            setValue("id", null);
            setValue("name", "");
            setValue("description", "");
            setValue("price", "");
            setValue("availableQuantity", "");
            // setValue("saleStart", "");
            setValue("saleEnd", "");
            setScheduleIds(
              eventType === "single"
                ? tickets[0]?.schedules.map((s) => s.scheduleId) || []
                : [],
            );
            setSelectedOption("all");
            setIsOpen(true);
          }}
          className={`rounded-lg bg-blue-600 px-4 py-2 text-xl font-medium text-white transition-colors hover:bg-blue-700`}
        >
          Tạo vé mới
        </button>
      </div>

      <div className="max-w-2xl space-y-4 px-3 pt-2">
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto_auto] items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs"
          >
            {/* left */}
            <div className="flex items-start gap-4">
              {/* <div className="cursor-move pt-1 text-xl">≡</div> */}
              <div>
                <div className="mb-2 text-lg font-bold capitalize">
                  {ticket.name}
                </div>
                <div className="flex items-center space-x-2">
                  <IoTicketOutline />
                  <p className="text-sm text-gray-500">
                    Tổng cộng: {ticket.availableQuantity} vé
                  </p>
                </div>
              </div>
            </div>

            {/* middle */}
            <div className="text-right">
              <div className="mb-2 text-lg font-bold">${ticket.price}</div>
              <p className="text-sm text-green-600">
                ● On Sale
                <span className="ml-3 text-gray-500">
                  Kết thúc mở bán vào
                  <span> {formatDateTime(ticket.saleEnd)}</span>
                </span>
              </p>
            </div>

            {/* right */}
            <div
              onClick={() => {
                handleTicketSelect(ticket);
                setIsOpen(true);
              }}
              className="hover:text-main cursor-pointer pt-4 text-black"
            >
              <IoEllipsisVertical size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* create ticket form */}
      <div
        // ref={panelRef}
        className={`fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-110 bg-white transition-transform duration-300 ease-in-out ${
          isOpen && section === "tickets"
            ? "translate-x-0 shadow-xl"
            : "translate-x-full"
        } flex flex-col`}
      >
        <div className="bg-secondary flex items-center justify-between border-b border-gray-200 px-6 py-3">
          <h2 className="text-xl font-semibold text-white">Tạo vé mới</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              clearErrors();
            }}
            className="hover:text-emphasis text-white transition-colors"
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
          <div className="flex flex-col space-y-3">
            {/* ticket name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Tên vé
              </label>
              <input
                type="text"
                placeholder="Nhập tên vé"
                {...register("name", {
                  required: "Tên vé là bắt buộc",
                })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.name ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.name.message === "string"
                    ? errors.name.message
                    : "Error!"}
                </p>
              )}
            </div>
            {/* ticket description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Mô tả
              </label>
              <textarea
                cols={3}
                placeholder="Nhập mô tả vé"
                {...register("description", {
                  //   required: "Mô tả là bắt buộc",
                })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.description ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
              />
            </div>
            {/* ticket price */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Giá vé
              </label>
              <input
                type="text"
                placeholder="Nhập giá vé"
                {...register("price", {
                  required: "Giá vé là bắt buộc",
                  min: { value: 0, message: "Giá vé phải lớn hơn hoặc bằng 0" },
                })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.price ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.price.message === "string"
                    ? errors.price.message
                    : "Error!"}
                </p>
              )}
            </div>
            {/* ticket quantity */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Số lượng
              </label>
              <input
                type="text"
                placeholder="Nhập số lượng vé"
                {...register("availableQuantity", {
                  required: "Số lượng vé là bắt buộc",
                })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.availableQuantity ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
              />
              {errors.availableQuantity && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.availableQuantity.message === "string"
                    ? errors.availableQuantity.message
                    : "Error!"}
                </p>
              )}
            </div>

            {/* apply ticket to schedules */}
            {eventType === "RECURRING" && (
              <div className="mt-1">
                <p className="mb-2 text-sm font-medium">Áp dụng vé cho</p>

                <div className="mb-2 flex items-center">
                  <input
                    type="radio"
                    name="discount"
                    className="mr-2"
                    value="all"
                    checked={selectedOption === "all"}
                    onChange={handleOptionChange}
                  />
                  <span>Tất cả lịch trình</span>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="discount"
                      className="mr-2"
                      value="certain"
                      checked={selectedOption === "certain"}
                      onChange={handleOptionChange}
                    />
                    <span>Chỉ một vài lịch trình</span>
                  </div>

                  {selectedOption === "certain" && (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      Chọn lịch trình
                    </button>
                  )}
                </div>

                {showScheduleModal && (
                  <ScheduleModal
                    closeModal={() => setShowScheduleModal(false)}
                    onSchedulesSelected={(selectedIds) => {
                      console.log("Đã chọn lịch trình:", selectedIds);
                      setScheduleIds(selectedIds);
                      setShowScheduleModal(false);
                    }}
                    schedules={
                      getValues("id")
                        ? tickets.find(
                            (ticket) => ticket.id === getValues("id"),
                          )?.schedules || []
                        : [
                            ...new Map(
                              tickets
                                .flatMap((ticket) => ticket.schedules)
                                .map((s) => [s.scheduleId, s]),
                            ).values(),
                          ]
                    }
                    initialSelectedIds={scheduleIds}
                  />
                )}
              </div>
            )}

            {/* sales start and sales end */}
            <div className="flex space-x-3">
              <div className="w-1/2 flex-col">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày bắt đầu bán vé
                </label>
                <input
                  type="datetime-local"
                  placeholder="Ngày bắt đầu"
                  {...register("saleStart", {
                    required: "Ngày bán đầu là bắt buộc",
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
                  defaultValue={(() => {
                    const now = new Date();
                    const offset = now.getTimezoneOffset();
                    const localTime = new Date(
                      now.getTime() - offset * 60 * 1000,
                    );
                    return localTime.toISOString().slice(0, 16);
                  })()}
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 text-sm outline-none ${errors.saleStart ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                />
                {errors.saleStart && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.saleStart.message === "string"
                      ? errors.saleStart.message
                      : "Error!"}
                  </p>
                )}
              </div>

              <div className="w-1/2 flex-col">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày kết thúc bán vé
                </label>
                <input
                  type="datetime-local"
                  placeholder="Ngày kết thúc"
                  {...register("saleEnd", {
                    required: "Ngày kết thúc là bắt buộc",
                    validate: (value, { saleStart }) => {
                      const startDate = new Date(saleStart);
                      const endDate = new Date(value);
                      return (
                        endDate > startDate ||
                        "Ngày kết thúc phải sau ngày bắt đầu"
                      );
                    },
                  })}
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.saleEnd ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                />
                {errors.saleEnd && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.saleEnd.message === "string"
                      ? errors.saleEnd.message
                      : "Error!"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmit(onSubmit)}
              className="mb-4 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
