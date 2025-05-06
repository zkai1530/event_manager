import { useState } from "react";
import { FaFilter } from "react-icons/fa";

const SearchFilter = ({ onApply }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [location, setLocation] = useState("Toàn quốc"); // Mặc định Toàn quốc
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customLocationValue, setCustomLocationValue] = useState("");
  const [price, setPrice] = useState("not_free"); // Mặc định không miễn phí
  const [eventStatus, setEventStatus] = useState("all"); // Mặc định Tất cả sự kiện
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleFilter = (e) => {
    e.preventDefault();
    setIsFilterOpen(!isFilterOpen);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    const displayName = e.target.labels[0].textContent.trim();
    setLocation(displayName);
    setIsCustomLocation(value === "other");
  };

  const handlePriceChange = () => {
    setPrice(price === "not_free" ? "free" : "not_free"); // Toggle giữa free và not_free
  };

  const handleEventStatusChange = (e) => {
    setEventStatus(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const applyFilters = () => {
    const filterData = {
      location: isCustomLocation ? customLocationValue : location,
      free: price === "free", // Trả về true/false
      eventStatus,
      startDate,
      endDate,
    };
    onApply(filterData);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setLocation("Toàn quốc");
    setIsCustomLocation(false);
    setCustomLocationValue("");
    setPrice("not_free");
    setEventStatus("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="relative flex">
      <div className="relative justify-end">
        <button
          type="button"
          onClick={toggleFilter}
          className="bg-main hover:bg-main-bold flex items-center rounded-lg px-4 py-2 text-white"
        >
          <div className="flex items-center space-x-2">
            <FaFilter />
            <span>Bộ lọc</span>
          </div>
        </button>
        {isFilterOpen && (
          <div className="absolute right-0 z-10 mt-2 w-100 rounded-lg bg-white p-4 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vị trí</h3>
              <button onClick={toggleFilter}>
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <div className="space-y-2">
              <label className="flex items-center text-[15px]">
                <input
                  type="radio"
                  name="location"
                  value="national"
                  checked={location === "Toàn quốc"}
                  onChange={handleLocationChange}
                  className="mr-2"
                />
                Toàn quốc
              </label>
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="location"
                  value="danang"
                  checked={location === "Đà Nẵng"}
                  onChange={handleLocationChange}
                  className="mr-2"
                />
                Đà Nẵng
              </label>
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="location"
                  value="hanoi"
                  checked={location === "Hà Nội"}
                  onChange={handleLocationChange}
                  className="mr-2"
                />
                Hà Nội
              </label>
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="location"
                  value="hochiminh"
                  checked={location === "Hồ Chí Minh"}
                  onChange={handleLocationChange}
                  className="mr-2"
                />
                Hồ Chí Minh
              </label>
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="location"
                  value="other"
                  checked={location === "Vị trí khác"}
                  onChange={handleLocationChange}
                  className="mr-2"
                />
                Vị trí khác
              </label>
              {isCustomLocation && (
                <input
                  type="text"
                  value={customLocationValue}
                  onChange={(e) => setCustomLocationValue(e.target.value)}
                  placeholder="Nhập vị trí"
                  className="focus:ring-main w-full rounded-lg border px-4 py-1 outline-none focus:border-none focus:ring-2"
                />
              )}
            </div>

            <h3 className="mt-1 mb-2 text-lg font-semibold">Giá tiền</h3>
            <div className="flex items-center justify-between space-y-2">
              <span className="mr-2 text-[15px]">Miễn phí</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={price === "free"}
                  onChange={handlePriceChange}
                  className="peer sr-only"
                />
                <div className="group peer peer-checked:bg-main h-6 w-14 rounded-full bg-gray-300 ring-2 ring-transparent duration-300 after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:duration-300 peer-checked:after:translate-x-8 peer-hover:after:scale-95"></div>
              </label>
            </div>

            <h3 className="mt-1 mb-2 text-lg font-semibold">Khoảng ngày</h3>
            <div className="space-y-2">
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="focus:ring-main w-full rounded-lg border px-4 py-1 outline-none focus:border-none focus:ring-2"
              />
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="focus:ring-main w-full rounded-lg border px-4 py-1 outline-none focus:border-none focus:ring-2"
              />
            </div>

            <h3 className="mt-1 mb-2 text-lg font-semibold">
              Trạng thái sự kiện
            </h3>
            <div className="space-y-2">
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="eventStatus"
                  value="all"
                  checked={eventStatus === "all"}
                  onChange={handleEventStatusChange}
                  className="mr-2"
                />
                Tất cả sự kiện
              </label>
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="eventStatus"
                  value="ongoing"
                  checked={eventStatus === "ongoing"}
                  onChange={handleEventStatusChange}
                  className="mr-2"
                />
                Sự kiện đang diễn ra
              </label>
              <label className="-mt-1 flex items-center text-[15px]">
                <input
                  type="radio"
                  name="eventStatus"
                  value="past"
                  checked={eventStatus === "past"}
                  onChange={handleEventStatusChange}
                  className="mr-2"
                />
                Sự kiện đã diễn ra
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={resetFilters}
                className="border-main text-main rounded-lg border-2 px-4 py-2 font-medium hover:bg-green-50"
              >
                Thiết lập lại
              </button>
              <button
                onClick={applyFilters}
                className="bg-main hover:bg-main-bold rounded-lg px-4 py-2 font-medium text-white"
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
