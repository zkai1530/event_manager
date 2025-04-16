import ScheduleModal from "components/modal/ScheduleModal";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useEventRoute } from "utils/useEventRoute";

const CreateTicket = () => {
  const { eventId, section } = useEventRoute();

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

  const onSubmit = (data) => {
    const dataWithSchedule = {
      ...data,
      scheduleIds: scheduleIds,
    };

    console.log("Dữ liệu gửi đi:", dataWithSchedule);
  };

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
      <div className="mb-8 flex justify-between">
        <h2 className="py-1 text-3xl font-bold">Vé sự kiện</h2>
        <button
          onClick={() => setIsOpen(true)}
          className={`rounded-lg bg-blue-600 px-4 py-2 text-xl font-medium text-white transition-colors hover:bg-blue-700 ${section === "promotions" && "hidden"}`}
        >
          Tạo vé mới
        </button>
      </div>
      <div className="flex">
        <div className="mb-2 items-center justify-center space-x-10">
          <Link
            to={`/manage/event/${eventId}/tickets`}
            className={`h-full cursor-pointer pb-[10px] text-[17px] font-semibold text-gray-500 duration-100 ${section === "tickets" ? "border-main text-main-bold border-b-2" : "hover:text-black"}`}
          >
            Thông tin vé
          </Link>
          <Link
            to={`/manage/event/${eventId}/promotions`}
            className={`h-full cursor-pointer pb-[10px] text-[17px] font-semibold text-gray-500 duration-100 ${section === "promotions" ? "border-main text-main-bold border-b-2" : "hover:text-black"}`}
          >
            Khuyến mãi
          </Link>
        </div>
      </div>
      <hr className="text-gray-300" />

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
                />
              )}
            </div>

            {/* sales start and sales end */}
            <div className="flex space-x-3">
              <div className="w-1/2 flex-col">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày bắt đầu bán vé
                </label>
                <input
                  type="datetime-local"
                  placeholder="Ngày bắt đầu"
                  {...register("salesStart", {
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
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 text-sm outline-none ${errors.salesStart ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                />
                {errors.salesStart && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.salesStart.message === "string"
                      ? errors.salesStart.message
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
                  {...register("salesEnd", {
                    required: "Ngày kết thúc là bắt buộc",
                    validate: (value, { salesStart }) => {
                      const startDate = new Date(salesStart);
                      const endDate = new Date(value);
                      return (
                        endDate > startDate ||
                        "Ngày kết thúc phải sau ngày bắt đầu"
                      );
                    },
                  })}
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.salesEnd ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                />
                {errors.salesEnd && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.salesEnd.message === "string"
                      ? errors.salesEnd.message
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
