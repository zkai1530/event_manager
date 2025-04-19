export const formatSchedule = (scheduleItem) => {
  const { scheduleDate, startTime, endTime } = scheduleItem;

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return days[date.getDay()];
  };

  const convertTo12Hour = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const dayOfWeek = getDayOfWeek(scheduleDate);
  const formattedDate = formatDate(scheduleDate); 
  const formattedStartTime = convertTo12Hour(startTime);
  const formattedEndTime = convertTo12Hour(endTime);

  return {
    dayOfWeek,
    formattedDate,
    formattedStartTime,
    formattedEndTime,
  };
};

export const formatDateTime = (rawDate) => {
  const date = new Date(rawDate);

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const day = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${time} - ${day}`;
};

