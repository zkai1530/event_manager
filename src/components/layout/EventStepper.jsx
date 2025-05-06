import Loading from "components/UI/Loading";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getEventInfoById, getEventProgress } from "services/user/eventService";
import { FaRocket } from "react-icons/fa";

const EventStepper = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const pathname = location.pathname;
  console.log(pathname);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const steps = [
    { id: 1, name: "Thông tin sự kiện", link: "details" },
    { id: 2, name: "Quản lý lịch trình", link: "schedules" },
    { id: 3, name: "Quản lý vé", link: "tickets" },
    { id: 4, name: "Xuất bản", link: "publish" },
  ];

  const [progress, setProgress] = useState({
    hasEvent: false,
    hasSchedule: false,
    hasTicket: false,
  });
  const [eventInfo, setEventInfo] = useState(null);

  // Tách eventId từ pathname: /manage/event/:eventId/*
  const match = pathname.match(/\/manage\/event\/([^/]+)/);
  const eventId = match && match[1] !== "create" ? match[1] : null;
  const isCreateMode = pathname.includes("/manage/event/create");

  useEffect(() => {
    if (!eventId) return;

    setIsLoading(true);

    Promise.allSettled([
      getEventProgress(eventId, token)
        .then(setProgress)
        .catch((err) => {
          console.error("getEventProgress:", err);
          throw err;
        }),
      getEventInfoById(eventId)
        .then(setEventInfo)
        .catch((err) => {
          console.error("getEventInfoById:", err);
          throw err;
        }),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [eventId, token]);

  console.log("pr", progress)

  const isStepEnabled = (stepId) => {
    if (isCreateMode) return stepId === 1;
    if (stepId === 1) return true;
    if (stepId === 2) return progress.hasEvent;
    if (stepId === 3) return progress.hasEvent && progress.hasSchedule;
    if (stepId === 4)
      return progress.hasEvent && progress.hasSchedule && progress.hasTicket;
    return false;
  };

  return (
    <div className="bg-secondary-light fixed h-[calc(100vh-4.063rem)] w-1/5 overflow-y-auto py-4">
      <div className="mb-4 flex items-center px-5">
        {/* <span className="mr-2 text-blue-500">←</span>
        <span className="text-blue-500">Back to events</span> */}
      </div>
      <div className="px-5">
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <img
            alt="Event banner"
            className="h-20 w-full rounded-t-lg object-cover"
            height="50"
            src="https://storage.googleapis.com/a1aa/image/ABDP3ZpXOIbnAYbgJb8Vs2arxs3rOzoQvFD-uhwe_c8.jpg"
            // src={eventInfo?.imageUrl}
            width="100"
          />
          <h2 className="mt-2 text-xl font-semibold">{eventInfo?.name}</h2>
          <div className="mt-2 flex items-center">
            <button className={`rounded-lg bg-gray-200 px-3 py-1 text-gray-700`}>
              {eventInfo != null && eventInfo?.isPublished
                ? "Đã xuất bản"
                : "Phác thảo"}
            </button>
            {/* <a className="ml-4 text-blue-600" href="#">
              Preview ↗
            </a> */}
          </div>
        </div>
      </div>

      <h3 className="mb-2 px-5 text-lg font-semibold">Các bước</h3>
      <ul className="space-y-2">
        {steps.map((step) => {
          if (
            (eventInfo?.eventType === "SINGLE" && step.id === 2) ||
            (!eventId && step.id === 2)
          )
            return null;
          const enabled = isStepEnabled(step.id);

          let linkPath;
          if (step.id === 1) {
            linkPath = isCreateMode
              ? "/manage/event/create"
              : `/manage/event/${eventId}/details`;
          } else {
            linkPath = isCreateMode
              ? "/manage/event/create"
              : `/manage/event/${eventId}/${step.link}`;
          }

          return (
            <li
              key={step.id}
              className={`flex cursor-pointer items-center rounded-lg px-5 py-3 transition-all duration-200 ${
                enabled ? "hover:bg-gray-100" : "!cursor-not-allowed"
              }`}
              onClick={() => enabled && navigate(linkPath)}
            >
              <span
                className={`bg-secondary mr-3 flex h-8 w-8 items-center justify-center rounded-full text-sm text-white ${
                  enabled ? "bg-blue-500" : "bg-gray-400"
                }`}
              >
                {step.id}
              </span>
              {enabled ? (
                <p className="font-medium text-black">{step.name}</p>
              ) : (
                <span className="font-medium text-gray-400">{step.name}</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 px-5">
        <button
          onClick={() => navigate(`/manage/event/${eventId}/event-dashboard`)}
          disabled={!eventId}
          className={`flex w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-600 ${!eventId ? "!cursor-not-allowed opacity-50" : "hover:from-blue-600 hover:to-purple-600"} ${!eventId ? "!cursor-not-allowed opacity-50" : "hover:from-blue-600 hover:to-purple-600"}`}
        >
          <FaRocket className="mr-2" />
          Dashboard Sự Kiện
        </button>
      </div>

      <Loading isLoading={isLoading} />
    </div>
  );
};

export default EventStepper;
