import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Heart,
  Filter,
  ArrowRight,
  Ticket,
  Star,
  TrendingUp,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "animate.css";
import { useInView } from "react-intersection-observer";
import {
  getEventsByDate,
  getRandomEvents,
  getTrendingEvents,
} from "@/services/user/eventService";
import { FormatPrice } from "@/utils/formatPrice";

// Dữ liệu mẫu
const featuredEvents = [
  {
    id: 1,
    name: "Đại nhạc hội Mùa Hè Sôi Động 2025",
    image:
      "https://ticketbox.vn/_next/image?url=https%3A%2F%2Fimages.tkbcdn.com%2F2%2F608%2F332%2Fts%2Fds%2F5f%2Ff6%2F12%2F0cd025b035cb58dfe10a28830f5e5ea5.jpg&w=640&q=75",
    date: "25/05/2025",
    location: "Nhà thi đấu Phú Thọ, TP.HCM",
    price: "250.000",
    category: "Âm nhạc",
    tag: "Hot",
  },
  {
    id: 2,
    name: "Vietnam Web Summit 2025",
    image:
      "https://ticketbox.vn/_next/image?url=https%3A%2F%2Fimages.tkbcdn.com%2F2%2F608%2F332%2Fts%2Fds%2F1c%2Ff0%2F78%2F10d455348ffb28159888c73a50d2645f.jpg&w=640&q=75",
    date: "10/06/2025",
    location: "White Palace Convention Center, Hà Nội",
    price: "1.200.000",
    category: "Hội nghị",
    tag: "Mới",
  },
  {
    id: 3,
    name: "Triển lãm Công nghệ Quốc tế",
    image:
      "https://ticketbox.vn/_next/image?url=https%3A%2F%2Fimages.tkbcdn.com%2F2%2F608%2F332%2Fts%2Fds%2F2b%2Fe3%2F5a%2F3e62e98f0deea71057e6b412a1ce105c.png&w=640&q=75",
    date: "15/06/2025",
    location: "SECC, TP.HCM",
    price: "100.000",
    category: "Triển lãm",
  },
];
const trendingEvents = [
  {
    id: 12,
    name: "Lễ hội ánh sáng 2025",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "15/07/2025",
    location: "Công viên Lê Văn Tám, TP.HCM",
    price: "200.000",
    category: "Festival",
    tag: "Xu hướng",
  },
  {
    id: 13,
    name: "Hội thảo AI & Tương Lai",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "20/07/2025",
    location: "Trung tâm Hội nghị Riverside, Hà Nội",
    price: "600.000",
    category: "Hội nghị",
  },
  {
    id: 14,
    name: "Triển lãm Nghệ thuật Đương Đại",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "25/07/2025",
    location: "Bảo tàng Mỹ thuật TP.HCM",
    price: "120.000",
    category: "Triển lãm",
  },
  {
    id: 15,
    name: "Đêm nhạc Acoustic Unplugged",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "30/07/2025",
    location: "The Rooftop Bar, Đà Nẵng",
    price: "300.000",
    category: "Âm nhạc",
  },
  {
    id: 16,
    name: "Đê nhạc Acoustic Unplugged",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "30/07/2025",
    location: "The Rooftop Bar, Đà Nẵng",
    price: "300.000",
    category: "Âm nhạc",
  },
  {
    id: 16,
    name: "Đê nhạc Acoustic Unplugged",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "30/07/2025",
    location: "The Rooftop Bar, Đà Nẵng",
    price: "300.000",
    category: "Âm nhạc",
  },
];

const categories = [
  { id: 1, name: "Âm nhạc", icon: "🎵", count: 42 },
  { id: 2, name: "Thể thao", icon: "⚽", count: 28 },
  { id: 3, name: "Hội nghị", icon: "🎤", count: 35 },
  { id: 4, name: "Workshop", icon: "💼", count: 19 },
  { id: 5, name: "Triển lãm", icon: "🖼️", count: 23 },
  { id: 6, name: "Festival", icon: "🎪", count: 16 },
  { id: 7, name: "Giải trí", icon: "🎭", count: 31 },
  { id: 8, name: "Ẩm thực", icon: "🍽️", count: 14 },
];

const popularEvents = [
  {
    id: 4,
    name: "Workshop Thiết kế UI/UX cho người mới bắt đầu",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "02/06/2025",
    location: "Dreamplex Coworking Space, TP.HCM",
    price: "500.000",
    category: "Workshop",
    tag: "Bán chạy",
  },
  {
    id: 5,
    name: "Giải vô địch Bóng đá Quốc gia 2025",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "05/06/2025",
    location: "Sân vận động Mỹ Đình, Hà Nội",
    price: "150.000",
    category: "Thể thao",
  },
  {
    id: 6,
    name: "Festival Ẩm thực Quốc tế Việt Nam",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "12/06/2025",
    location: "Công viên 23/9, TP.HCM",
    price: "80.000",
    category: "Festival",
  },
  {
    id: 7,
    name: "Hòa nhạc Dàn nhạc Giao hưởng Việt Nam",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "20/06/2025",
    location: "Nhà hát Lớn Hà Nội",
    price: "350.000",
    category: "Âm nhạc",
  },
];

const upcomingEvents = [
  {
    id: 8,
    name: "TEDx Saigon 2025",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "25/06/2025",
    location: "Hội trường Thống Nhất, TP.HCM",
    price: "450.000",
    category: "Hội nghị",
  },
  {
    id: 9,
    name: "Workshop Digital Marketing 2025",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "30/06/2025",
    location: "SIHUB, TP.HCM",
    price: "350.000",
    category: "Workshop",
  },
  {
    id: 10,
    name: "Tour Du lịch Văn hóa và Ẩm thực",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "05/07/2025",
    location: "Chợ Bến Thành, TP.HCM",
    price: "550.000",
    category: "Ẩm thực",
    tag: "Khuyến mãi",
  },
  {
    id: 11,
    name: "Comedy Night với Hoài Linh",
    image:
      "https://images.tkbcdn.com/2/608/332/ts/ds/d5/4d/cd/3953cb59682e6ec1bd327b3184df5d2d.jpg",
    date: "10/07/2025",
    location: "Nhà Văn hóa Thanh niên, TP.HCM",
    price: "250.000",
    category: "Giải trí",
  },
];

const cities = [
  { id: 1, name: "Hồ Chí Minh", count: 156 },
  { id: 2, name: "Hà Nội", count: 132 },
  { id: 3, name: "Đà Nẵng", count: 87 },
  { id: 4, name: "Nha Trang", count: 54 },
  { id: 5, name: "Cần Thơ", count: 43 },
  { id: 6, name: "Huế", count: 38 },
];

// Component chính
export default function HomePage() {
  const token = localStorage.getItem("token");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("weekend");
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const period = activeTab === "weekend" ? "weekend" : "month";
        const [trending, random, upcoming] = await Promise.all([
          getTrendingEvents(),
          getRandomEvents(),
          getEventsByDate(period),
        ]);

        setTrendingEvents(trending);
        setPopularEvents(random);
        setUpcomingEvents(upcoming);
      } catch (err) {
        setIsLoading(false);
        console.error("fetchEvents:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, activeTab]);

  // Hiệu ứng auto-slide cho featured events
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === featuredEvents.length - 1 ? 0 : prev + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === featuredEvents.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredEvents.length - 1 : prev - 1,
    );
  };

  const handleHeartClick = (event, imageSrc, eventId) => {
    const heartIcon = document.querySelector(".FaRegHeart");
    if (!heartIcon) return;

    const rect = heartIcon.getBoundingClientRect();
    // Tính toán tọa độ đích (giữa biểu tượng FaRegHeart)
    const targetX = rect.left + window.scrollX + rect.width / 2; // Giữa theo chiều ngang
    const targetY = rect.top + window.scrollY + rect.height / 2; // Giữa theo chiều dọc

    // Tạo clone của hình ảnh
    const imgClone = new Image();
    imgClone.src = imageSrc;
    imgClone.className =
      "absolute w-20 h-20 rounded-lg opacity-80 transition-all duration-1000 z-150";
    document.body.appendChild(imgClone);

    // Lấy phần tử cha
    const cardElement = event.target.closest(".group");
    if (!cardElement) return;

    const cardRect = cardElement.getBoundingClientRect();
    // Vị trí ban đầu của clone (giữa hình ảnh card)
    imgClone.style.left = `${cardRect.left + window.scrollX + cardRect.width / 2 - 80}px`; // -80 để căn giữa w-20
    imgClone.style.top = `${cardRect.top + window.scrollY + cardRect.height / 2 - 80}px`; // -80 để căn giữa h-20

    setTimeout(() => {
      // Bay đến vị trí đích (giữa FaRegHeart)
      imgClone.style.transform = `translate(${targetX - (cardRect.left + window.scrollX + cardRect.width / 2 - 40)}px, ${targetY - (cardRect.top + window.scrollY + cardRect.height / 2 - 40)}px) scale(0.2)`;
      imgClone.style.opacity = "0";
      imgClone.ontransitionend = () => imgClone.remove();
    }, 10);
  };

  // const { ref: popularRef, inView: popularInView } = useInView({
  //   triggerOnce: true, // Chỉ trigger một lần khi scroll tới
  // });
  const { ref: popularRef, inView: popularInView } = useInView();
  const { ref: trendingRef, inView: trendingInView } = useInView();
  const { ref: upcomingRef, inView: upcomingInView } = useInView();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Banner tìm kiếm tương tự như TicketBox */}
      <section className="relative h-[500px] overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
        {/* Carousel ảnh */}
        <div className="absolute inset-0">
          {[
            "https://salt.tkbcdn.com/ts/ds/1c/f0/78/10d455348ffb28159888c73a50d2645f.jpg",
            "https://salt.tkbcdn.com/ts/ds/1a/2c/a1/8d41e6a6d325f907b7e14b4582428461.jpg",
            "https://salt.tkbcdn.com/ts/ds/51/4a/63/390a98adc7c30abd1c1e1be13ddc06f7.jpg",
          ].map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <div className="bg-opacity-50 absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <img
                src={image}
                alt={`Event Banner ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Nút điều hướng */}
        <button
          className="bg-opacity-30 hover:bg-opacity-50 absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-white transition-all hover:scale-110"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="bg-opacity-30 hover:bg-opacity-50 absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white p-2 text-white transition-all hover:scale-110"
          onClick={nextSlide}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Nội dung chính */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-5xl font-extrabold text-white drop-shadow-lg md:text-6xl">
              Chào đón thế giới sự kiện
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-200 drop-shadow-md">
              Khám phá những khoảnh khắc đáng nhớ cùng hàng ngàn sự kiện độc
              đáo.
            </p>
            <a
              href="#events"
              className="rounded-lg bg-white px-8 py-4 font-semibold text-blue-900 transition-all hover:bg-blue-100 hover:shadow-xl"
            >
              Khám phá ngay
            </a>
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
          {[0, 1, 2].map((_, index) => (
            <button
              key={index}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "bg-opacity-50 bg-white"
              }`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Các danh mục sự kiện */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="animate__animated animate__fadeIn mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Khám phá theo danh mục
            </h2>
            <button className="flex items-center font-medium text-blue-600 hover:text-blue-800">
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <button
                key={category.id}
                className="group rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:shadow-md"
                onClick={() => setActiveCategory(category.name)}
              >
                <div className="mb-2 text-3xl transition-transform group-hover:scale-110">
                  {category.icon}
                </div>
                <h3 className="mb-1 font-medium text-gray-800 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {category.count} sự kiện
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sự kiện nổi bật */}
      <div ref={popularRef}>
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="mySwiper"
        >
          {popularEvents.map((event) => (
            <SwiperSlide key={event.id}>
              <div
                className={`group relative overflow-hidden rounded-xl bg-white shadow transition-all duration-1500 hover:shadow-lg ${popularInView ? "translate-y-0 opacity-100" : "-translate-x-20 opacity-0"}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* {event.tag && (
                    <span className="absolute top-3 left-3 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                      {event.tag}
                    </span>
                  )} */}
                  <button
                    onClick={(e) =>
                      handleHeartClick(e, event.imageUrl, event.eventId)
                    }
                    className="bg-opacity-80 hover:bg-opacity-100 absolute top-3 right-3 rounded-full bg-white p-1.5 text-gray-600 transition-colors hover:scale-110 hover:text-red-500"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  {/* <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    {event.category}
                  </span> */}
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                    {event.name}
                  </h3>
                  <div className="mb-2 flex items-center text-sm text-gray-600">
                    <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                    <span>{event.scheduleDate}</span>
                  </div>
                  {/* <div className="mb-3 flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div> */}
                  <div className="flex items-center justify-between">
                    <span className="bg-main-light text-main-bold rounded px-2 py-1 font-bold">
                      {FormatPrice(event.minPrice)}
                    </span>
                    <button className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="animate__animated animate__fadeIn text-2xl font-bold text-gray-800">
              Sự kiện xu hướng
            </h2>
            <button className="flex items-center font-medium text-blue-600 hover:text-blue-800">
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          <div ref={trendingRef}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="mySwiper"
            >
              {trendingEvents.map((event) => (
                <SwiperSlide key={event.eventId}>
                  <div
                    className={`group relative overflow-hidden rounded-xl bg-white shadow transition-all duration-1500 hover:shadow-lg $${trendingInView ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* {event.tag && (
                        <span className="absolute top-3 left-3 rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
                          {event.tag}
                        </span>
                      )} */}
                      <button
                        onClick={(e) =>
                          handleHeartClick(e, event.imageUrl, event.eventId)
                        }
                        className="bg-opacity-80 hover:bg-opacity-100 absolute top-3 right-3 rounded-full bg-white p-1.5 text-gray-600 transition-colors hover:scale-110 hover:text-red-500"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      {/* <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {event.category}
                      </span> */}
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                        {event.name}
                      </h3>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                        <span>{event.scheduleDate}</span>
                      </div>
                      {/* <div className="mb-3 flex items-center text-sm text-gray-600">
                        <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div> */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600">
                          {FormatPrice(event.minPrice)}đ
                        </span>
                        <button className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Tab sự kiện */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Sự kiện tuần này
            </h2>
            <div className="flex space-x-2">
              <button className="font-medium text-gray-500 hover:text-gray-800">
                <Filter className="mr-1 inline h-4 w-4" /> Lọc
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="hide-scrollbar flex space-x-8 overflow-x-auto">
              <button
                className={`relative pb-3 text-sm font-medium ${
                  activeTab === "weekend"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("weekend")} // Chỉ thay đổi tab
              >
                Tuần này
              </button>
              <button
                className={`relative pb-3 text-sm font-medium ${
                  activeTab === "month"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("month")} // Chỉ thay đổi tab
              >
                Tháng này
              </button>
            </div>
          </div>

          {/* Events Swiper */}
          <div ref={upcomingRef}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              navigation
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="mySwiper"
            >
              {upcomingEvents.map((event) => (
                <SwiperSlide key={event.eventId}>
                  <div
                    className={`group relative overflow-hidden rounded-xl bg-white shadow transition-all duration-1500 hover:shadow-lg ${upcomingInView ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {event.tag && (
                        <span className="absolute top-3 left-3 rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
                          {event.tag}
                        </span>
                      )}
                      <button
                        onClick={(e) =>
                          handleHeartClick(e, event.imageUrl, event.eventId)
                        }
                        className="bg-opacity-80 hover:bg-opacity-100 absolute top-3 right-3 rounded-full bg-white p-1.5 text-gray-600 transition-colors hover:scale-110 hover:text-red-500"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {event.category || "Chưa phân loại"}
                      </span>
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                        {event.name}
                      </h3>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                        <span>{event.scheduleDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600">
                          {FormatPrice(event.minPrice)}đ
                        </span>
                        <button className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white">
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Thành phố phổ biến */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold text-gray-800">
            Thành phố phổ biến
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {cities.map((city) => (
              <button
                key={city.id}
                className="group rounded-lg border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:shadow-md"
              >
                <h3 className="mb-1 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                  {city.name}
                </h3>
                <p className="text-xs text-gray-500">{city.count} sự kiện</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="animate__animated animate__fadeIn rounded-xl border border-blue-100 bg-blue-50 p-6 transition-all hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-transform hover:scale-110">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-800">
                Đặt vé dễ dàng
              </h3>
              <p className="text-gray-600">
                Mua vé chỉ với vài bước đơn giản, không cần xếp hàng chờ đợi
              </p>
            </div>

            <div className="animate__animated animate__fadeIn rounded-xl border border-purple-100 bg-purple-50 p-6 transition-all hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 transition-transform hover:scale-110">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-800">
                Sự kiện chất lượng
              </h3>
              <p className="text-gray-600">
                Các sự kiện được tổ chức chuyên nghiệp với nhiều ưu đãi hấp dẫn
              </p>
            </div>

            <div className="animate__animated animate__fadeIn rounded-xl border border-green-100 bg-green-50 p-6 transition-all hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 transition-transform hover:scale-110">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-800">
                Quản lý hiệu quả
              </h3>
              <p className="text-gray-600">
                Công cụ quản lý sự kiện, thống kê và báo cáo chi tiết
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA đăng ký */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FFFFFF" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: "15px 15px",
            }}
          ></div>
        </div>

        <div className="animate__animated animate__fadeIn relative z-10 container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
              Bạn muốn tổ chức sự kiện?
            </h2>
            <p className="mb-8 text-lg text-blue-100 drop-shadow-md">
              Tạo và quản lý sự kiện của bạn một cách chuyên nghiệp, tiếp cận
              hàng ngàn người tham dự tiềm năng trên nền tảng của chúng tôi.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition-all hover:scale-105 hover:bg-blue-50 hover:shadow-lg">
                Đăng ký ngay
              </a>
              <a className="hover:bg-opacity-10 rounded-lg border border-white px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-white hover:text-blue-600">
                Tìm hiểu thêm
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CSS cho scroll bar ẩn */}
      {/* <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style> */}
    </div>
  );
}
