import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import Loading1 from "@/components/ui/Loading1";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} tháng ${month}, ${year}`;
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
        new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime(),
    );
  return futureSchedules.length > 0
    ? futureSchedules[0]
    : validSchedules.length > 0
      ? validSchedules[validSchedules.length - 1]
      : null;
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

const isEventPast = (schedules) => {
  const currentDate = new Date();
  const validSchedules = (schedules || []).filter(
    (schedule) => schedule.ticketSchedules != null,
  );
  return validSchedules.every(
    (schedule) => new Date(schedule.scheduleDate) < currentDate,
  );
};

const RecommendEvent = ({ userId, eventId }) => {
  const navigate = useNavigate();
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        let apiUrl = "";
        if (eventId) {
          apiUrl = `http://localhost:5000/recommend/event/${eventId}`;
        } else if (userId) {
          apiUrl = `http://localhost:5000/recommend/${userId}`;
        } else {
          throw new Error("userId or eventId is required");
        }

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setRecommendedEvents(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRecommendedEvents([]);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [userId, eventId]);

  return (
    <div>
      <h2 className="font-main mb-4 text-2xl font-bold text-black">
        {eventId ? "Sự kiện tương tự" : "Sự kiện gợi ý"}
      </h2>
      {loadingRecs ? (
        <div className="flex justify-center p-4">
          <Loading1 isLoading={loadingRecs} />
        </div>
      ) : recommendedEvents.length === 0 ? (
        <div className="text-center text-gray-600">Không có sự kiện gợi ý</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recommendedEvents.map((event) => {
            const nearestDate = getNearestFutureDate(event.schedules);
            const isPast = isEventPast(event.schedules);
            const priceDisplay = nearestDate
              ? getPriceDisplay(nearestDate)
              : "Không có lịch";

            return (
              <div
                key={event.eventId}
                className="relative cursor-pointer overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-lg"
                onClick={() => navigate(`/details/${event.slug}`)}
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
                    <FaMapMarkerAlt size={16} className="text-main-bold mr-1" />
                    <span>
                      {event.eventLocation.city}, {event.eventLocation.country}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendEvent;
