import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // CSS mặc định của react-calendar
import { useForm } from "react-hook-form";

const InteractiveCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [section, setSection] = useState("tickets");

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    setIsOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsOpen(true);
    setSection("tickets");

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    setValue("salesStart", formattedDate);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      return "calendar-tile";
    }
    return null;
  };

  return (
    <div className="p-6">
      {/* Phần lịch */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Manage dates and times
        </h2>
        <p className="mb-4 text-gray-600">
          Start by adding the dates and time slots for your recurring event...
        </p>

        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          className="border-none"
        />
      </div>

      {/* Form Sidebar */}
      <div
        className={`fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-110 bg-white transition-transform duration-300 ease-in-out ${
          isOpen && section === "tickets"
            ? "translate-x-0 shadow-xl"
            : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 px-6 py-3">
          <h2 className="text-xl font-semibold text-white">Tạo vé mới</h2>
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
          <div className="flex flex-col space-y-3">
            {/* Ticket Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Tên vé
              </label>
              <input
                type="text"
                placeholder="Nhập tên vé"
                {...register("name", { required: "Tên vé là bắt buộc" })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                  errors.name
                    ? "border-2 border-red-500"
                    : "focus:border-none focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.name.message === "string"
                    ? errors.name.message
                    : "Error!"}
                </p>
              )}
            </div>

            {/* Ticket Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Mô tả
              </label>
              <textarea
                cols={3}
                placeholder="Nhập mô tả vé"
                {...register("description")}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                  errors.description
                    ? "border-2 border-red-500"
                    : "focus:border-none focus:ring-2 focus:ring-blue-500"
                }`}
              />
            </div>

            {/* Ticket Price */}
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
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                  errors.price
                    ? "border-2 border-red-500"
                    : "focus:border-none focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.price.message === "string"
                    ? errors.price.message
                    : "Error!"}
                </p>
              )}
            </div>

            {/* Ticket Quantity */}
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
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                  errors.availableQuantity
                    ? "border-2 border-red-500"
                    : "focus:border-none focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {errors.availableQuantity && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.availableQuantity.message === "string"
                    ? errors.availableQuantity.message
                    : "Error!"}
                </p>
              )}
            </div>

            {/* Sales Start and End */}
            <div className="flex space-x-3">
              <div className="w-1/2 flex-col">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày bắt đầu bán vé
                </label>
                <input
                  type="date" // Thay từ datetime-local thành date
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
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 text-sm outline-none ${
                    errors.salesStart
                      ? "border-2 border-red-500"
                      : "focus:border-none focus:ring-2 focus:ring-blue-500"
                  }`}
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
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                    errors.salesEnd
                      ? "border-2 border-red-500"
                      : "focus:border-none focus:ring-2 focus:ring-blue-500"
                  }`}
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
              className="mb-4 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCalendar;
