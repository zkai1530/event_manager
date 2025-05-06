import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import Loading1 from "components/UI/Loading1";
import { getFavoriteEvents, removeFavorite } from "services/user/favoriteService";
import { FormatPrice } from "utils/formatPrice";

const FavoriteEvent = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get("page")) || 0;

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getFavoriteEvents(page, token);
      setEvents(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("fetchEvents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(events);

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [page, token]);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    navigate(`/user/favorite-event?page=${page}`);
  }, [page, navigate]);

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const formatEventDate = (schedule) => {
    if (!schedule) return "";
    const dateObj = new Date(`${schedule.scheduleDate}T${schedule.startTime}`);
    return dateObj.toLocaleString("vi-VN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const sortedEvents = [...events].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateA = a.nearestSchedule
      ? new Date(a.nearestSchedule.scheduleDate)
      : new Date(Infinity);
    const dateB = b.nearestSchedule
      ? new Date(b.nearestSchedule.scheduleDate)
      : new Date(Infinity);
    const isAPast = dateA < today;
    const isBPast = dateB < today;
    if (isAPast && !isBPast) return 1;
    if (!isAPast && isBPast) return -1;
    return dateA.getTime() - dateB.getTime();
  });

  const handleRemoveFavorite = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await removeFavorite(eventId, token);
      await fetchEvents();
    } catch (error) {
      console.error("addFavorite", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const isEventPast = (schedule) => {
  //   if (!schedule) return false;
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const eventDate = new Date(schedule.scheduleDate);
  //   return eventDate < today;
  // };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-main-bold mb-5 text-4xl font-bold">Yêu thích</h1>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loading1 isLoading={isLoading}></Loading1>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg">Bạn chưa có sự kiện yêu thích nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center rounded-lg p-4 transition-all hover:shadow-[0px_0px_8px_2px_#97F9FF,0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
              onClick={() => navigate(`/details/${event.eventId}`)}
            >
              <div className="mr-4 h-22 w-32">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 uppercase">
                  {event.name}
                  {event.nearestSchedule === null && (
                    <span className="ml-2 items-center text-red-500">
                      (Đã kết thúc)
                    </span>
                  )}
                </h3>
                <p className="text-sm text-orange-500">
                  {formatEventDate(event.nearestSchedule)}
                </p>
                <p className="text-sm text-gray-600">{`${event.eventLocation.address},  ${event.eventLocation.city}, ${event.eventLocation.country}`}</p>
                {event.cheapestTicketPrice && (
                  <p className="text-main font-bold">
                    Từ {FormatPrice(event.cheapestTicketPrice)}
                  </p>
                )}
              </div>
              <div className="flex">
                <button
                  className="cursor-pointer rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(event.eventId);
                  }}
                >
                  <FaHeart size={22} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className="px-4 py-2 disabled:opacity-50"
              >
                Trước
              </button>
              <span>
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteEvent;
