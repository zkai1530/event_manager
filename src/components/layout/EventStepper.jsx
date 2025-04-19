import Loading from "components/UI/Loading";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getEventProgress } from "services/fakeApi";
import { getEventInfoById } from "services/user/eventService";

const EventStepper = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const pathname = location.pathname;
  console.log(pathname);
  const [isLoading, setIsLoading] = useState(false);
  const steps = [
    { id: 1, name: "Event Details", link: "details" },
    { id: 2, name: "Schedule", link: "schedules" },
    { id: 3, name: "Tickets", link: "tickets" },
    { id: 4, name: "Preview", link: "preview" },
  ];

  const [progress, setProgress] = useState({
    hasDetails: false,
    hasSchedule: false,
    hasTickets: false,
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
      getEventProgress(eventId)
        .then(setProgress)
        .catch((err) => {
          console.error("getEventProgress:", err);
          throw err;
        }),
      getEventInfoById(eventId, token)
        .then(setEventInfo)
        .catch((err) => {
          console.error("getEventInfoById:", err);
          throw err;
        }),
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [eventId, token]);

  const isStepEnabled = (stepId) => {
    if (isCreateMode) return stepId === 1;
    if (stepId === 1) return true;
    if (stepId === 2) return progress.hasDetails;
    if (stepId === 3) return progress.hasDetails && progress.hasSchedule;
    if (stepId === 4) return progress.hasTickets;
    return false;
  };
  return (
    <div className="bg-secondary-light fixed h-[calc(100vh-4.063rem)] w-1/5 py-4">
      <div className="mb-4 flex items-center px-5">
        <span className="mr-2 text-blue-500">←</span>
        <span className="text-blue-500">Back to events</span>
      </div>
      <div className="px-5">
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <img
            alt="Event banner"
            className="h-20 w-full rounded-t-lg object-cover"
            height="50"
            src="https://storage.googleapis.com/a1aa/image/ABDP3ZpXOIbnAYbgJb8Vs2arxs3rOzoQvFD-uhwe_c8.jpg"
            width="100"
          />
          <h2 className="mt-2 text-xl font-semibold">FB are trend</h2>
          <div className="mt-2 flex items-center">
            <button className="rounded-lg bg-gray-200 px-3 py-1 text-gray-700">
              Draft ▼
            </button>
            <a className="ml-4 text-blue-600" href="#">
              Preview ↗
            </a>
          </div>
        </div>
      </div>

      <h3 className="mb-2 px-5 text-lg font-semibold">Steps</h3>
      <ul>
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
            <li key={step.id} className="flex items-center px-5 py-4">
              <span className="bg-secondary mr-2 flex h-8 w-8 items-center justify-center rounded-full text-sm text-white">
                {step.id}
              </span>

              {enabled ? (
                <Link to={linkPath} className="text-black hover:underline">
                  {step.name}
                </Link>
              ) : (
                <span className="cursor-not-allowed text-gray-400">
                  {step.name}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <Loading isLoading={isLoading} />
    </div>
  );
};

export default EventStepper;
