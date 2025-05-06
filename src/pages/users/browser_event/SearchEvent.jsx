import { useNavigate, useSearchParams } from "react-router-dom";
import SearchFilter from "components/UI/SearchFilter";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { searchEvents } from "services/user/eventService";
import Loading1 from "components/UI/Loading1";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} tháng ${month}, ${year}`;
};

const SearchEvent = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const location = searchParams.get("location") || "Toàn quốc"; // Mặc định Toàn quốc
  const isFree = searchParams.get("isFree") === "true" || false; // Mặc định false
  const startDate = searchParams.get("startDate") || null;
  const endDate = searchParams.get("endDate") || null;
  const eventStatus = searchParams.get("eventStatus") || "all"; // Mặc định Tất cả sự kiện
  const page = parseInt(searchParams.get("page")) || 0;
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await searchEvents(
          searchQuery,
          location,
          isFree,
          startDate,
          endDate,
          eventStatus,
          page,
        );
        setEvents(data.data.content);
        setTotalPages(data.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [searchQuery, location, isFree, startDate, endDate, eventStatus, page]); // Thêm eventStatus vào dependency

  const handleApplyFilters = (filterData) => {
    const { location, free, startDate, endDate, eventStatus } = filterData;
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (location) params.append("location", location);
    params.append("isFree", free);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (eventStatus) params.append("eventStatus", eventStatus);
    // params.append("page", page.toString());
    params.append("page", "0");
    navigate(`?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    navigate(`?${params.toString()}`);
  };

  const getNearestFutureDate = (schedules) => {
    const currentDate = new Date();
    const validSchedules = (schedules || []).filter(
      (schedule) => schedule.ticketSchedules != null,
    );
    const futureSchedules = validSchedules
      .filter((schedule) => new Date(schedule.scheduleDate) >= currentDate)
      .sort(
        (a, b) =>
          new Date(a.scheduleDate).getTime() -
          new Date(b.scheduleDate).getTime(),
      );
    return futureSchedules.length > 0
      ? futureSchedules[0]
      : validSchedules.length > 0
        ? validSchedules[validSchedules.length - 1]
        : null;
  };

  const isEventPast = (schedules) => {
    const currentDate = new Date();
    const validSchedules = (schedules || []).filter(
      (schedule) => schedule.ticketSchedules != null,
    );
    return validSchedules.every(
      (schedule) => new Date(schedule.scheduleDate) < currentDate,
    );
  };

  const getPriceDisplay = (schedule) => {
    if (
      !schedule ||
      !schedule.ticketSchedules ||
      schedule.ticketSchedules.length === 0
    ) {
      return "Không có vé";
    }
    const tickets = schedule.ticketSchedules;
    const allFree = tickets.every((ticket) => ticket.price === 0);
    if (allFree) return "Miễn phí";
    if (tickets.length === 1) return `${tickets[0].price.toLocaleString()}đ`;
    const minPrice = Math.min(...tickets.map((ticket) => ticket.price));
    return `Từ ${minPrice.toLocaleString()}đ`;
  };

  return (
    <div className="py-4">
      <div className="flex w-full justify-end">
        <SearchFilter onApply={handleApplyFilters} />
      </div>
      {loading ? (
        <div className="flex justify-center p-4">
          <Loading1 isLoading={loading} />
        </div>
      ) : (
        <div className="mt-4">
          {events.length === 0 ? (
            <div className="text-center text-gray-600">
              Không có sự kiện nào
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...events]
                  .sort((a, b) => {
                    const aIsPast = isEventPast(a.schedules);
                    const bIsPast = isEventPast(b.schedules);
                    return aIsPast === bIsPast ? 0 : aIsPast ? 1 : -1;
                  })
                  .map((event) => {
                    const nearestDate = getNearestFutureDate(event.schedules);
                    const isPast = isEventPast(event.schedules);
                    const priceDisplay = nearestDate
                      ? getPriceDisplay(nearestDate)
                      : "Không có lịch";

                    return (
                      <div
                        key={event.eventId}
                        className="relative cursor-pointer overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-lg"
                        onClick={() => navigate(`/details/${event.eventId}`)}
                      >
                        <div className="relative">
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="h-46 w-full object-cover"
                          />
                          {isPast && (
                            <div className="absolute top-0 right-0 rounded bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                              Đã diễn ra
                            </div>
                          )}
                        </div>
                        <div className="bg-white px-2 py-3">
                          <h3 className="line-clamp-2 min-h-[2.5rem] text-lg leading-tight font-semibold">
                            {event.name}
                          </h3>
                          <p className="font-main mt-2 font-bold text-[#55c6ac]">
                            {priceDisplay}
                          </p>
                          <p className="mt-2 text-[15px] text-gray-600">
                            <span className="mr-1 inline-block">🗓️</span>
                            {nearestDate
                              ? formatDate(nearestDate.scheduleDate)
                              : "Không có lịch"}
                          </p>
                          <p className="space mt-1 flex items-center text-[15px] text-gray-600">
                            <FaMapMarkerAlt
                              size={16}
                              className="text-main-bold mr-1"
                            />
                            <span>
                              {event.eventLocation.city},{" "}
                              {event.eventLocation.country}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="self-center">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchEvent;
