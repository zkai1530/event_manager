import Loading from "components/UI/Loading";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEventListInfoByUser } from "services/user/eventService";
import { formatSchedule } from "utils/formatSchedule";

const ListEvents = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getEventListInfoByUser(token)
      .then(setEvents)
      .catch((err) => {
        console.error("getEventListInfoByUser", err);
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);
  console.log("aa", events);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <h1 className="font-logo mb-4 text-6xl font-[900] text-gray-900">
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
          <button className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white">
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
          </button>
          <button className="flex items-center space-x-2 rounded-lg border px-4 py-2 text-gray-700">
            <span>Phác thảo</span>
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-white">
          Tạo sự kiện
        </button>
      </div>

      {/* List Events */}
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="inline-block min-w-full p-1.5 align-middle">
            <div className="overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary">
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
                      Action
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
                          <td className="px-6 py-4 text-end text-sm font-medium whitespace-nowrap">
                            <button
                              type="button"
                              className="inline-flex items-center gap-x-2 rounded-lg border border-transparent text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Edit
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
      <Loading isLoading={isLoading} />
    </div>
  );
};

export default ListEvents;
