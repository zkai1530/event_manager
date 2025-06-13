import Loading1 from "@/components/ui/Loading1";
import {
  countEventsByTheme,
  getEventSummary,
  getEvents,
} from "@/services/admin/eventService";
import { useEffect, useRef, useState } from "react";
import { FaBan } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Pagination from "@/components/ui/Pagination";
import { useLocation, useNavigate } from "react-router-dom";

const EventManagement = () => {
  const [eventSummary, setEventSummary] = useState({
    completedEvents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    ticketSales: 0,
  });
  const [eventTheme, setEventTheme] = useState([]);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ status: "", sort: "tickets" });
  const [page, setPage] = useState(0);
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEventList, setIsLoadingEventList] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const tableRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summaryData = await getEventSummary(token);
        setEventSummary(summaryData);
      } catch (error) {
        console.error("fetchSummary:", error?.response?.data || error.message);
      }
    };

    if (token) {
      fetchSummary();
    }
  }, [token]);

  useEffect(() => {
    const fetchEventsByTheme = async () => {
      setIsLoading(true);
      try {
        const data = await countEventsByTheme(token);
        const formattedData = data
          .map((item) => ({
            themeName: item.themeName,
            eventCount: item.eventCount,
          }))
          .sort((a, b) => {
            if (a.themeName === "Khác") return 1;
            if (b.themeName === "Khác") return -1;
            return a.themeName.localeCompare(b.themeName);
          });
        setEventTheme(formattedData);
      } catch (error) {
        console.error("fetchEventsByTheme ", error?.response?.data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventsByTheme();
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page") || "1", 10);

    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }

    const fetchData = async () => {
      setIsLoadingEventList(true);
      try {
        // Gọi getEvents
        const eventsData = await getEvents(
          token,
          filters.status || "",
          filters.sort || "tickets",
          pageFromUrl - 1,
        );
        setEvents(eventsData.content || []);
        setTotalPages(eventsData.totalPages || 0);
      } catch (error) {
        console.error(
          "Error fetching data",
          error?.response?.data || error.message,
        );
      } finally {
        setIsLoadingEventList(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, filters, page, location.search, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const chartConfig = {
    eventCount: {
      label: "Số sự kiện",
      color: "#40e0d0",
    },
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setPage(0);
  };

  return (
    <div className="">
      <div className="mb-8">
        <header className="bg-main p-4 text-white shadow-md">
          <h1 className="text-2xl font-bold uppercase">Quản lý sự kiện</h1>
        </header>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-stats rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="max-w-full text-sm whitespace-normal text-gray-500 uppercase">
                Tổng sự kiện
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {/* {eventSummary.totalEvents} */}
                <AnimatedCounter
                  targetValue={eventSummary.totalEvents}
                  format={null}
                />
              </p>
              <p className="mt-1 text-sm text-green-500">
                +12% <span className="text-gray-500">so với tháng trước</span>
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <i className="fas fa-calendar text-xl text-blue-500"></i>
            </div>
          </div>
        </div>

        <div className="card-stats rounded-lg border-l-4 border-green-500 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 uppercase">
                Sự kiện sắp diễn ra
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {
                  <AnimatedCounter
                    targetValue={eventSummary.upcomingEvents}
                    format={null}
                  />
                }
              </p>
              <p className="mt-1 text-sm text-green-500">
                +5% <span className="text-gray-500">so với tháng trước</span>
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <i className="fas fa-running text-xl text-green-500"></i>
            </div>
          </div>
        </div>

        <div className="card-stats rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 uppercase">
                Sự kiện đã diễn ra
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {
                  <AnimatedCounter
                    targetValue={eventSummary.completedEvents}
                    format={null}
                  />
                }
              </p>
              <p className="mt-1 text-sm text-green-500">
                +8% <span className="text-gray-500">so với tháng trước</span>
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <i className="fas fa-hourglass-half text-xl text-yellow-500"></i>
            </div>
          </div>
        </div>

        <div className="card-stats rounded-lg border-l-4 border-purple-500 bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-gray-500 uppercase">Lượt bán vé</h3>
              <p className="text-3xl font-bold text-gray-800">
                {
                  <AnimatedCounter
                    targetValue={eventSummary.ticketSales}
                    format={null}
                  />
                }
              </p>
              <p className="mt-1 text-sm text-green-500">
                +18% <span className="text-gray-500">so với tháng trước</span>
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <i className="fas fa-ticket-alt text-xl text-purple-500"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-1">
        <Card className="">
          <CardHeader className="">
            <CardTitle className="text-lg">
              Số lượng sự kiện theo chủ đề
            </CardTitle>
            <CardDescription className="">
              Thống kê sự kiện theo danh mục chủ đề
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {isLoading ? (
              <div className="flex items-center justify-center text-center">
                <Loading1 isLoading={true} />
              </div>
            ) : eventTheme && eventTheme.length > 0 ? (
              <ChartContainer
                id="events-theme"
                className="h-[400px] w-full"
                config={chartConfig}
              >
                <BarChart
                  accessibilityLayer
                  data={eventTheme}
                  margin={{
                    top: 25,
                    bottom: 25,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="themeName"
                    tickLine={false}
                    tickMargin={15}
                    axisLine={false}
                    // tickFormatter={(value) => value.slice(0, 3)}
                    // angle={30}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="eventCount"
                    fill="var(--color-eventCount)"
                    radius={8}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">Không có dữ liệu</div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Thống kê số sự kiện theo chủ đề <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Hiển thị tổng số sự kiện theo danh mục chủ đề
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Tìm tên sự kiện..."
                className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-none focus:ring-2 focus:outline-none"
                onChange={handleFilterChange}
              />
              <i className="fas fa-search absolute top-3 right-3 text-gray-400"></i>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
              onChange={handleFilterChange}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="hidden">Đã ẩn</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sắp xếp theo
            </label>
            <select
              name="sort"
              value={filters.sort}
              className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
              onChange={handleFilterChange}
            >
              <option value="tickets">Lượt bán vé</option>
              <option value="date_desc">Mới nhất</option>
            </select>
          </div>
        </div>
        {/* <div className="mt-4 mb-4 flex justify-end">
          <button
            onClick={handleApplyFilters}
            className="bg-main hover:bg-main-bold flex cursor-pointer items-center rounded-lg px-4 py-2 text-white transition duration-300"
          >
            Lọc kết quả
          </button>
        </div> */}

        {/* Danh sách sự kiện dạng bảng */}
        <div className="mt-8 mb-8 overflow-hidden rounded-lg bg-white shadow">
          <div className="">
            <table
              className="table-layout-fixed w-full max-w-full divide-y divide-gray-200"
              ref={tableRef}
            >
              <thead className="bg-main">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "30%" }}
                  >
                    <div className="flex items-center">
                      <span>Tên sự kiện</span>
                      <button className="ml-1 text-gray-400 hover:text-gray-600">
                        <i className="fas fa-sort"></i>
                      </button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "10%" }}
                  >
                    <div className="flex items-center justify-center">
                      <span>Danh mục</span>
                      <button className="ml-1 text-gray-400 hover:text-gray-600">
                        <i className="fas fa-sort"></i>
                      </button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "20%" }}
                  >
                    <div className="flex items-center justify-center">
                      <span>Địa điểm</span>
                      <button className="ml-1 text-gray-400 hover:text-gray-600">
                        <i className="fas fa-sort"></i>
                      </button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "20%" }}
                  >
                    <div className="flex items-center justify-center">
                      <span>Số lượng vé</span>
                      <button className="ml-1 text-gray-400 hover:text-gray-600">
                        <i className="fas fa-sort"></i>
                      </button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "11%" }}
                  >
                    <div className="flex items-center justify-center">
                      <span>Trạng thái</span>
                      <button className="ml-1 text-gray-400 hover:text-gray-600">
                        <i className="fas fa-sort"></i>
                      </button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-right text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "9%" }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoadingEventList ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      <div className="inline-flex items-center justify-center">
                        <Loading1 isLoading={true} />
                      </div>
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      Không có sự kiện nào
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.eventId} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-normal">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={event.imageUrl}
                              alt="Thumbnail"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="line-clamp-1 text-sm font-medium text-gray-900">
                              {event.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: #{event.eventId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-normal">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                            event.categoryName === "Âm nhạc"
                              ? "bg-blue-100 text-blue-800"
                              : event.categoryName === "Công nghệ"
                                ? "bg-purple-100 text-purple-800"
                                : event.categoryName === "Kinh doanh"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.categoryName || "Không xác định"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-normal">
                        <div className="text-sm text-gray-900">
                          {event.city || "Không xác định"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.address || "Không xác định"}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                        <div className="flex items-center justify-start pl-3">
                          <div className="mr-2 h-2.5 w-30 rounded-full bg-gray-200">
                            <div
                              className="h-2.5 rounded-full bg-blue-600"
                              style={{
                                width: `${
                                  event.ticketTotal > 0
                                    ? (event.ticketSold / event.ticketTotal) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {event.ticketSold}/{event.ticketTotal}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-normal">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                            event.status === "Chưa đăng"
                              ? "bg-yellow-100 text-yellow-800"
                              : event.status === "Sắp diễn ra"
                                ? "bg-blue-100 text-blue-800"
                                : event.status === "Đã ẩn"
                                  ? "bg-gray-100 text-gray-800"
                                  : event.status === "Đã diễn ra"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {event.status || "Không xác định"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium whitespace-normal">
                        <div className="flex items-center justify-center">
                          {event.status === "Đã ẩn" ? (
                            <button className="text-green-600 hover:text-green-900">
                              <i className="fas fa-eye mr-1"></i> Hiện
                            </button>
                          ) : (
                            <button className="cursor-pointer rounded-sm bg-red-100 p-2">
                              <FaBan size={18} className="text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              totalPages={totalPages}
              onPageChange={(newPage) => {
                handlePageChange(newPage);
                tableRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
