export const getEventProgress = async (eventId) => {
  console.log("Fetching event progress for", eventId);

  if (!eventId) {
    return { hasDetails: false, hasSchedule: false, hasTickets: false };
  }

  if (eventId === "123") {
    return {
      hasDetails: true,
      hasSchedule: true,
      hasTickets: false,
    };
  }

  // Có thể mock thêm trường hợp khác nếu cần
  return { hasDetails: false, hasSchedule: false, hasTickets: false };
};
