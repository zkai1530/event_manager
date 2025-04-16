import { useParams, useLocation } from "react-router-dom";

export const useEventRoute = () => {
  const { eventId } = useParams();
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const section = pathSegments[pathSegments.length - 1];

  return { eventId, section };
};
