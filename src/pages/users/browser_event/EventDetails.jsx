import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FormatPrice } from "utils/formatPrice";
import { MdTimer } from "react-icons/md";
import DOMPurify from "dompurify";
import { useParams } from "react-router-dom";
import { getEventInfoById } from "services/user/eventService";
import TicketSelectionModal from "components/modal/TicketSelectionModal";
import Loading from "components/UI/Loading";

// const fakeData = {
//   eventId: 7,
//   name: "Tech Conference 2025",
//   imageUrl: "https://i.ibb.co/KjwT91m0/event-background.jpg",
//   summary: "A conference for technology enthusiasts.",
//   description:
//     "<p>Join us for a day of tech talks, networking, and hands-on workshops.</p>",
//   capacity: 500,
//   eventType: "RECURRING",
//   isPublished: false,
//   eventLocation: {
//     city: "Hanoi",
//     address: "123 Main Street",
//     postalCode: "100000",
//     country: "Vietnam",
//   },
//   schedules: [
//     {
//       scheduleId: 24,
//       scheduleDate: "2025-04-28",
//       startTime: "10:00:00",
//       endTime: "11:00:00",
//       ticketSchedules: [
//         {
//           id: 6,
//           name: "VIP Ticket",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//         {
//           id: 7,
//           name: "VIP Ticket",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//         {
//           id: 8,
//           name: "VIP Ticket",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//         {
//           id: 9,
//           name: "VIP Ticket",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//         {
//           id: 10,
//           name: "VIP Ticket hạng vé phổ thông danh cho người dưới 19",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//         {
//           id: 11,
//           name: "VIP Ticket",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//       ],
//     },
//     {
//       scheduleId: 25,
//       scheduleDate: "2025-04-29",
//       startTime: "10:00:00",
//       endTime: "11:00:00",
//       ticketSchedules: [
//         {
//           id: 6,
//           name: "VIP Ticket",
//           description: "Access to all areas",
//           sold: 0,
//           price: 100.0,
//           availableQuantity: 50,
//           saleStart: "2025-04-01T10:00:00",
//           saleEnd: "2025-04-05T22:00:00",
//           discounts: [
//             {
//               discountId: "3",
//               name: "Early Bird Discount",
//               promoCode: null,
//               discountType: "PERCENT",
//               discountValue: 15.0,
//               maxUses: null,
//               timesUsed: 0,
//               discountStart: "2025-04-20T00:00:00",
//               discountEnd: "2025-04-21T23:59:59",
//             },
//             {
//               discountId: "4",
//               name: "abcd",
//               promoCode: "banvatoi",
//               discountType: "PERCENT",
//               discountValue: 10.0,
//               maxUses: 20,
//               timesUsed: 0,
//               discountStart: "2025-04-21T11:43:00",
//               discountEnd: "2025-04-22T11:43:00",
//             },
//           ],
//         },
//       ],
//     },
//     {
//       scheduleId: 26,
//       scheduleDate: "2025-05-10",
//       startTime: "07:00:00",
//       endTime: "09:00:00",
//       ticketSchedules: [],
//     },
//   ],
//   faqs: [
//     {
//       id: 10,
//       answer: "Business casual.",
//       question: "What is the dress code?",
//     },
//     {
//       id: 11,
//       answer: "Yes, lunch and coffee breaks are included.",
//       question: "Will food be provided?",
//     },
//   ],
// };

const EventDetails = () => {
  const [eventData, setEventData] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [openFAQStates, setOpenFAQStates] = useState(null);
  const { eventId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // useEffect(() => {
  //   setEventData(fakeData);
  //   const filteredSchedules = filterAndSortSchedules(fakeData.schedules);
  //   setSelectedSchedule(
  //     filteredSchedules.length > 0 ? filteredSchedules[0] : null,
  //   );

  //   setOpenFAQStates(fakeData.faqs.map(() => false));
  // }, []);

  useEffect(() => {
    setIsLoading(true);
    getEventInfoById(eventId)
      .then((data) => {
        setEventData(data);
        console.log("data", data);
        console.log("data", data);

        const filteredSchedules = filterAndSortSchedules(data.schedules);
        setSelectedSchedule(
          filteredSchedules.length > 0 ? filteredSchedules[0] : null,
        );

        setOpenFAQStates(data.faqs.map(() => false));
      })
      .catch((err) => {
        console.log("getEventInfoById", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [eventId]);
  console.log("selectedSchedule ",selectedSchedule)

  const filterAndSortSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) return [];

    const currentDate = new Date();
    const futureSchedules = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduleDate);
      return scheduleDate >= currentDate;
    });

    // Nếu còn schedule trong tương lai, chỉ hiển thị chúng
    if (futureSchedules.length > 0) {
      return [...futureSchedules].sort(
        (a, b) =>
          new Date(a.scheduleDate).getTime() -
          new Date(b.scheduleDate).getTime(),
      );
    }

    // Nếu tất cả schedule đã qua, hiển thị tất cả
    return [...schedules].sort(
      (a, b) =>
        new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime(),
    );
  };

  const toggleFAQ = (index) => {
    setOpenFAQStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state)),
    );
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const calculateDiscountedPrice = (price, discounts) => {
    const currentDate = new Date();
    let finalPrice = price;

    discounts.forEach((discount) => {
      const discountStart = new Date(discount.discountStart);
      const discountEnd = new Date(discount.discountEnd);

      if (
        discount.promoCode === null &&
        currentDate >= discountStart &&
        currentDate <= discountEnd
      ) {
        if (discount.discountType === "PERCENT") {
          const discountAmount = (price * discount.discountValue) / 100;
          finalPrice -= discountAmount;
        } else if (discount.discountType === "FIXED") {
          finalPrice -= discount.discountValue;
        }
      }
    });

    return finalPrice > 0 ? finalPrice : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString("vi", { weekday: "long" });
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${weekday}, ${month}/${day}`;
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getFutureSchedules = (schedules) => {
    const currentDate = new Date("2025-04-23");
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduleDate);
      return scheduleDate > currentDate;
    });
  };

  const calculateEventDuration = (schedules) => {
    const futureSchedules = getFutureSchedules(schedules);

    if (futureSchedules.length === 0) {
      return "Sự kiện đã kết thúc.";
    }

    const getHours = (time) => {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      return hours + minutes / 60 + seconds / 3600;
    };

    const durations = futureSchedules.map((schedule) => {
      const startHours = getHours(schedule.startTime);
      const endHours = getHours(schedule.endTime);
      return (endHours - startHours).toFixed(2);
    });

    if (futureSchedules.length === 1) {
      return `Kéo dài ${durations[0]} giờ`;
    }

    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    if (minDuration === maxDuration) {
      return `Kéo dài ${minDuration} giờ`;
    } else {
      return `Kéo dài từ ${minDuration} đến ${maxDuration} giờ`;
    }
  };

  // tính giá vé
  const calculateEventPrice = (schedules) => {
    const currentDate = new Date();
    const futureSchedules = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.scheduleDate);
      return scheduleDate >= currentDate;
    });

    if (futureSchedules.length === 0) {
      return "Sự kiện đã kết thúc.";
    }

    const prices = futureSchedules.flatMap((schedule) =>
      schedule.ticketSchedules.map((ticket) => ticket.price),
    );

    if (prices.length === 0) {
      return "Không có thông tin giá vé.";
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `Giá: ${FormatPrice(minPrice)}`;
    } else {
      return `Giá từ: ${FormatPrice(minPrice)}`;
    }
  };

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const breakpointsResponsive = {
    "@0.00": {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    "@0.75": {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    "@1.00": {
      slidesPerView: 3,
      spaceBetween: 10,
    },
    "@1.50": {
      slidesPerView: 7,
      spaceBetween: 1,
    },
  };

  const handleSwiperEvents = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <>
      {eventData && (
        <div>
          <div className="relative w-full py-8">
            {/* ticket container */}
            <div
              className="relative flex h-120 overflow-hidden rounded-2xl bg-[#505055]"
              style={{
                border: "2px solid white",
                // minHeight: "400px",
              }}
            >
              {/* Left section: content */}
              <div className="flex w-1/3 flex-col p-8">
                <h2 className="font-inter mb-2 text-[1.5rem] font-bold text-white uppercase">
                  {eventData.name}
                </h2>
                <div className="flex flex-col w-full">
                  <div className="mb-2 flex items-center space-x-3">
                    <FaMapMarkerAlt size={22} className="text-white" />
                    <p className="text-main text-sm font-bold">{`${eventData.eventLocation.address}, ${eventData.eventLocation.city}, ${eventData.eventLocation.country}`}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MdTimer size={20} className="text-white" />
                    <p className="text-main text-sm font-bold">
                      {calculateEventDuration(eventData.schedules)}
                    </p>
                  </div>
                </div>
                <h2 className="text-main font-inter mt-auto border-t-2 border-white pt-3 text-3xl font-bold">
                  {calculateEventPrice(eventData.schedules).includes(":") ? (
                    <>
                      {/* <span className="text-white">
                    {calculateEventPrice(eventData.schedules).split(": ")[0]}:
                  </span>{" "}
                  <span className="text-main font-semibold">
                    {calculateEventPrice(eventData.schedules).split(": ")[1]}
                  </span> */}
                      <span className="text-white">Giá từ: </span>
                      <span className="text-main font-semibold">
                        {FormatPrice(
                          Math.min(
                            ...selectedSchedule.ticketSchedules.map((ticket) =>
                              calculateDiscountedPrice(
                                ticket.price,
                                ticket.discounts,
                              ),
                            ),
                          ),
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="text-main">
                      {calculateEventPrice(eventData.schedules)}
                    </span>
                  )}
                </h2>
              </div>

              {/* Right section: image*/}
              <div className="relative w-2/3">
                <img
                  src={eventData.imageUrl}
                  alt="Event Ticket"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Dashed vertical line in the middle */}
              <div className="absolute top-0 left-1/3 h-full border-l-2 border-dashed border-white" />

              {/* Small circular cutouts on all 4 edges */}
              {/* {Array.from({ length: 49 }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="absolute top-[-6px] h-3 w-3 -translate-x-1/2 transform rounded-full bg-white"
              style={{
                left: `${(i + 1) * 2}%`,
                zIndex: 10,
              }}
            />
          ))}
          {Array.from({ length: 49 }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="absolute bottom-[-6px] h-3 w-3 -translate-x-1/2 transform rounded-full bg-white"
              style={{
                left: `${(i + 1) * 2}%`,
                zIndex: 10,
              }}
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`left-${i}`}
              className="absolute left-[-6px] h-3 w-3 -translate-y-1/2 transform rounded-full bg-white"
              style={{
                top: `${(i + 1) * 6}%`,
                zIndex: 10,
              }}
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`right-${i}`}
              className="absolute right-[-6px] h-3 w-3 -translate-y-1/2 transform rounded-full bg-white"
              style={{
                top: `${(i + 1) * 6}%`,
                zIndex: 10,
              }}
            />
          ))} */}
            </div>

            {/* Large circular cutouts at top and bottom at 1/3 position */}
            <div
              className="absolute top-[10px] left-1/3 h-11 w-12 -translate-x-1/2 transform rounded-full bg-white"
              style={{ zIndex: 10 }}
            />
            <div
              className="absolute bottom-[10px] left-1/3 h-11 w-12 -translate-x-1/2 transform rounded-full bg-white"
              style={{ zIndex: 10 }}
            />
          </div>
          <div className="flex min-h-screen flex-col space-x-20 py-4 md:flex-row">
            {/* left section: event info */}
            <div className="flex flex-col md:w-2/3">
              {/* select date and time */}
              <div>
                <h2 className="font-main mb-4 text-2xl font-bold text-black">
                  Chọn ngày và khung giờ
                </h2>
                <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-6">
                  <div className="flex justify-between">
                    <p className="mb-4 text-sm text-gray-600">
                      {selectedSchedule ? (
                        <>
                          Bắt đầu vào{" "}
                          {
                            formatDate(selectedSchedule.scheduleDate).split(
                              ",",
                            )[0]
                          }
                          , ngày{" "}
                          {
                            formatDate(selectedSchedule.scheduleDate)
                              .split(", ")[1]
                              .split("/")[1]
                          }
                          /
                          {
                            formatDate(selectedSchedule.scheduleDate)
                              .split(", ")[1]
                              .split("/")[0]
                          }
                          /
                          {new Date(
                            selectedSchedule.scheduleDate,
                          ).getFullYear()}{" "}
                          từ {formatTime(selectedSchedule.startTime)} -{" "}
                          {formatTime(selectedSchedule.endTime)}
                        </>
                      ) : (
                        "Không có lịch trình"
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        className={`custom-prev bg-main hover:bg-main-bold z-10 rounded-full p-[6px] text-neutral-50 ${isBeginning ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        disabled={isBeginning}
                      >
                        <FaChevronLeft size={18} />
                      </button>
                      <button
                        className={`custom-next bg-main hover:bg-main-bold z-10 rounded-full p-[6px] text-neutral-50 ${isEnd ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        disabled={isEnd}
                      >
                        <FaChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Swiper
                      slidesPerView={2}
                      spaceBetween={5}
                      navigation={{
                        nextEl: ".custom-next",
                        prevEl: ".custom-prev",
                      }}
                      breakpoints={breakpointsResponsive}
                      onSlideChange={(swiper) => handleSwiperEvents(swiper)}
                      onInit={(swiper) => handleSwiperEvents(swiper)}
                      modules={[Navigation]}
                      className="mySwiper"
                    >
                      {filterAndSortSchedules(eventData.schedules).map(
                        (schedule) => (
                          <SwiperSlide
                            key={schedule.scheduleId}
                            className="flex justify-center"
                          >
                            <div
                              onClick={() => handleScheduleSelect(schedule)}
                              className={`mt-2 mb-2 ml-2 w-25 cursor-pointer rounded-lg border-2 border-gray-200 py-4 text-center duration-500 ${
                                selectedSchedule?.scheduleId ===
                                schedule.scheduleId
                                  ? "ring-main border-none ring-3"
                                  : "border-gray-200 hover:shadow-[0_0_15px_rgba(0,0,0,0.15)]"
                              }`}
                            >
                              <p className="text-md font-semibold">
                                {
                                  formatDate(schedule.scheduleDate).split(
                                    ",",
                                  )[0]
                                }
                              </p>
                              <div className="mt-1">
                                <hr className="mx-auto mb-1 w-16 border-gray-200" />
                                <p className="text-sm text-gray-600">
                                  Tháng{" "}
                                  {
                                    formatDate(schedule.scheduleDate)
                                      .split(", ")[1]
                                      .split("/")[0]
                                  }
                                </p>
                              </div>
                              <div className="flex items-center justify-center">
                                <p
                                  className={`mt-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                                    selectedSchedule?.scheduleId ===
                                    schedule.scheduleId
                                      ? "bg-main text-white"
                                      : "bg-main-light text-gray-700"
                                  }`}
                                >
                                  {
                                    formatDate(schedule.scheduleDate)
                                      .split(", ")[1]
                                      .split("/")[1]
                                  }
                                </p>
                              </div>
                              <p className="mt-2 text-sm text-gray-600">
                                {formatTime(schedule.startTime)}
                              </p>
                            </div>
                          </SwiperSlide>
                        ),
                      )}
                    </Swiper>
                  </div>
                </div>
              </div>
              {/* event description */}
              <div className="mt-6">
                <h2 className="font-main mb-4 text-2xl font-bold text-black">
                  Thông tin về sự kiện
                </h2>
                <div
                  className="prose max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(eventData.description),
                  }}
                />
              </div>
              {/* FAQS */}
              {eventData.faqs && eventData.faqs.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-main mb-3 text-2xl font-bold text-black">
                    Các câu hỏi thường gặp
                  </h2>
                  <div className="space-y-4">
                    {eventData.faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200">
                        <div
                          onClick={() => toggleFAQ(index)}
                          className="flex cursor-pointer items-center justify-between py-3"
                        >
                          <h3 className="text-lg font-medium text-gray-900">
                            {faq.question}
                          </h3>
                          {openFAQStates[index] ? (
                            <FaChevronUp className="text-gray-600" />
                          ) : (
                            <FaChevronDown className="text-gray-600" />
                          )}
                        </div>
                        {openFAQStates[index] && (
                          <div className="mb-3 rounded-lg bg-gray-100 px-4 py-3 text-gray-700">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Section: Sticky Ticket Info */}
            <div className="sticky top-[5.063rem] self-start md:w-1/3">
              <div className="flex flex-col items-center rounded-2xl border-2 border-gray-200 bg-white px-5 py-4">
                {calculateEventPrice(eventData.schedules).includes(
                  "kết thúc",
                ) ? (
                  <p className="mb-5 text-xl font-semibold text-gray-800">
                    Sự kiện đã kết thúc
                  </p>
                ) : (
                  <>
                    <p className="mb-5 text-xl font-semibold text-gray-800">
                      {selectedSchedule &&
                      selectedSchedule.ticketSchedules.length > 0 ? (
                        <>
                          {FormatPrice(
                            Math.min(
                              ...selectedSchedule.ticketSchedules.map(
                                (ticket) =>
                                  calculateDiscountedPrice(
                                    ticket.price,
                                    ticket.discounts,
                                  ),
                              ),
                            ),
                          )}{" "}
                          -{" "}
                          <span className="font-semibold text-gray-800">
                            {FormatPrice(
                              Math.max(
                                ...selectedSchedule.ticketSchedules.map(
                                  (ticket) =>
                                    calculateDiscountedPrice(
                                      ticket.price,
                                      ticket.discounts,
                                    ),
                                ),
                              ),
                            )}
                          </span>
                        </>
                      ) : (
                        "Không có vé"
                      )}
                    </p>
                    <button
                      className="bg-emphasis w-full cursor-pointer rounded-lg px-6 py-2 text-xl text-white hover:bg-orange-700"
                      onClick={() => setShowTicketModal(true)}
                      disabled={
                        !selectedSchedule ||
                        selectedSchedule.ticketSchedules.length === 0
                      }
                    >
                      Chọn vé ngay
                    </button>
                  </>
                )}

                {showTicketModal && eventData && selectedSchedule && (
                  <TicketSelectionModal
                    eventInfo={{
                      name: eventData.name,
                      imageUrl: eventData.imageUrl,
                      tickets: selectedSchedule.ticketSchedules.map(
                        (ticket) => ({
                          id: ticket.id,
                          name: ticket.name,
                          price: ticket.price,
                          saleEnd: ticket.saleEnd,
                          discounts: ticket.discounts,
                        }),
                      ),
                    }}
                    selectedSchedule={selectedSchedule}
                    calculateDiscountedPrice={calculateDiscountedPrice}
                    closeModal={() => setShowTicketModal(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Loading isLoading={isLoading} />
    </>
  );
};

export default EventDetails;
