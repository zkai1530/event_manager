import { useEffect, useState } from "react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  BarChart2,
  AlertTriangle,
  Banknote,
  Lock,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Ticket,
  GitCommitVertical,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardOverview,
  getEventsByMonth,
  getRecentOrders,
  getRevenueByMonth,
  getTop5EventsByRevenue,
} from "@/services/admin/dashboardService";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import Loading1 from "@/components/ui/Loading1";
import { FormatPrice } from "@/utils/formatPrice";
import { formatRevenue } from "@/utils/formatRevenue";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const [revenueData, setRevenueData] = useState([]);
  const [topEventsData, setTopEventsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRevenueYear, setSelectedRevenueYear] = useState(
    new Date().getFullYear(),
  );
  const [selectedEventsYear, setSelectedEventsYear] = useState(
    new Date().getFullYear(),
  );

  const dashboardData = [
    {
      value: 0,
      description: "Tổng sự kiện",
      icon: BarChart2,
      badge: "Sự kiện",
    },
    {
      value: 0,
      description: "Tổng doanh thu",
      icon: Banknote,
      badge: "Doanh thu",
      format: formatRevenue, // Giữ formatRevenue
    },
    {
      value: 0,
      description: "Tổng vé bán được",
      icon: Ticket,
      badge: "Đơn hàng",
    },
    {
      value: 0,
      description: "Tỷ lệ check-in",
      icon: CheckCircle2,
      badge: "Check-in",
      format: (val) => `${val.toFixed(1)}%`, // Giữ format %
    },
    {
      value: 0,
      description: "Người dùng đã đăng ký",
      icon: UserCheck,
      badge: "Người dùng",
    },
    {
      value: 0,
      description: "Tổng khiếu nại",
      icon: AlertTriangle,
      badge: "Khiếu nại",
    },
    {
      value: 0,
      description: "Tài khoản vi phạm",
      icon: Lock,
      badge: "Bị khóa",
    },
    {
      value: 0,
      description: "Sự kiện bị nghi gian lận",
      icon: ShieldAlert,
      badge: "Gian lận",
    },
  ];

  const [cardData, setCardData] = useState(dashboardData);

  useEffect(() => {
    getDashboardOverview(token)
      .then((data) => {
        setCardData([
          { ...dashboardData[0], value: data.totalEvents },
          { ...dashboardData[1], value: data.totalRevenue },
          { ...dashboardData[2], value: data.totalTicketsSold },
          { ...dashboardData[3], value: data.checkInRate },
          { ...dashboardData[4], value: data.totalUsers },
          { ...dashboardData[5], value: data.totalComplaints },
          { ...dashboardData[6], value: data.totalBlockedUsers },
          { ...dashboardData[7], value: data.totalHiddenEvents },
        ]);
      })
      .catch((err) => console.error(err?.response?.data));

    // Hiệu ứng card
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      if (card instanceof HTMLElement) {
        card.style.opacity = "0";
        setTimeout(() => {
          card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, index * 150);
        card.style.transform = "translateY(15px)";
      }
    });
  }, [token]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await getRevenueByMonth(token, selectedRevenueYear);
        const revenue = response.revenue;
        const data = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          revenue: revenue[String(i + 1)] || 0,
        }));
        setRevenueData(data);
      } catch (err) {
        console.error("fetchRevenueData:", err);
      }
    };

    fetchRevenueData();
  }, [token, selectedRevenueYear]);

  useEffect(() => {
    const fetchTopEvents = async () => {
      try {
        const response = await getTop5EventsByRevenue(
          token,
          "2025-01-01",
          "2025-12-31",
        );
        setTopEventsData(response.topEvents);
      } catch (err) {
        console.error("fetchTopEvents:", err);
      }
    };

    fetchTopEvents();
  }, [token]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await getEventsByMonth(token, selectedEventsYear);
        setEventsData(response);
      } catch (err) {
        console.error("fetchEventData:", err);
      }
    };

    fetchEventData();
  }, [token, selectedEventsYear]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await getRecentOrders(token);
        setOrders(response);
      } catch (err) {
        console.error("fetchOrders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-main p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold">Dashboard Quản Trị Viên</h1>
      </header>

      {/* Card Content */}
      <main className="py-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {cardData.map(
            ({ value, description, icon: Icon, badge, format }, idx) => (
              <div
                key={idx}
                className="card group flex flex-col justify-between rounded-2xl bg-white p-5 shadow-[0px_0px_7px_-1px_rgba(0,0,0,0.17)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0px_0px_9px_2px_#97F9FF,0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
                style={{ minHeight: "160px" }}
              >
                <div className="flex items-center justify-between">
                  <div className="bg-main-light rounded-xl p-2">
                    <Icon className="text-main-bold h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-400">
                    {badge}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    <AnimatedCounter targetValue={value} format={format} />
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                </div>
              </div>
            ),
          )}
        </div>
      </main>

      {/* Chart content */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        {/* Chart revenue by month */}
        <Card className="w-full">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-[#4fc9da]">
                Doanh Thu Theo Tháng
              </CardTitle>
              <CardDescription className="">
                Chọn năm để xem doanh thu theo tháng
              </CardDescription>
            </div>

            <div className="flex gap-4">
              <select
                value={selectedRevenueYear}
                onChange={(e) => setSelectedRevenueYear(Number(e.target.value))}
                className="border-main rounded border-2 p-2"
              >
                {Array.from(
                  { length: new Date().getFullYear() - 2015 + 1 },
                  (_, i) => 2015 + i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="">
            {revenueData && revenueData.length > 0 ? (
              <ChartContainer
                id="revenue-by-month-chart"
                config={{
                  revenue: {
                    label: "Doanh Thu",
                    color: "#57dffb",
                  },
                }}
                className="aspect-square max-h-[300px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={revenueData}
                  margin={{
                    left: 4,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                    tickFormatter={(value) => `Tháng ${value}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatRevenue(value)}
                    tickCount={5}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="#57dffb"
                    strokeWidth={3}
                    dot={({ cx, cy, payload }) => {
                      const r = 24;
                      return (
                        <GitCommitVertical
                          key={payload.month}
                          x={cx - r / 2}
                          y={cy - r / 2}
                          width={r}
                          height={r}
                          fill="hsl(var(--background))"
                          stroke="#57dffb"
                        />
                      );
                    }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">
                <div className="flex items-center justify-center">
                  <Loading1 isLoading={true} />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Hiển thị doanh thu theo tháng trong năm {selectedRevenueYear}{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Chart top 5 events by revenue */}
        <Card className="w-full">
          <CardHeader className="">
            <CardTitle className="">Top 5 Sự Kiện Theo Doanh Thu</CardTitle>
            <CardDescription className="">Năm 2025</CardDescription>
          </CardHeader>
          <CardContent className="">
            <ChartContainer
              className="w-full"
              id="top-events-revenue"
              config={{
                revenue: {
                  label: "Doanh Thu",
                  color: "#40e0d0",
                },
                label: {
                  color: "#40e0d0",
                },
              }}
              style={{
                height: `${300}px`,
              }}
            >
              <BarChart
                accessibilityLayer
                data={topEventsData}
                layout="vertical"
                height={250}
                margin={{
                  right: 150,
                  top: -5,
                  bottom: 10,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  hide
                />
                <XAxis
                  dataKey="revenue"
                  type="number"
                  domain={[0, "dataMax"]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="revenue"
                  layout="vertical"
                  fill="var(--color-revenue)"
                  radius={8}
                  barSize={40}
                >
                  <LabelList
                    dataKey="name"
                    position="insideLeft"
                    offset={8}
                    className="fill-white font-semibold"
                    fontSize={12}
                  />
                  <LabelList
                    position="right"
                    offset={8}
                    content={({ value, x, y, width, index }) => {
                      const event = topEventsData[index];
                      const xPos = Number(x) + Number(width) + 10;
                      const yPos = Number(y) - 1;

                      return (
                        <g transform={`translate(${xPos}, ${yPos})`}>
                          <defs>
                            <pattern
                              id={`avatar-pattern-${index}`}
                              patternUnits="objectBoundingBox"
                              width={1}
                              height={1}
                            >
                              <image
                                href={event.imageUrl}
                                width={40}
                                height={40}
                                preserveAspectRatio="xMidYMid slice"
                              />
                            </pattern>
                          </defs>

                          <circle
                            cx={20}
                            cy={20}
                            r={20}
                            fill={`url(#avatar-pattern-${index})`}
                          />

                          {/* Text hiển thị doanh thu */}
                          <text
                            x={50}
                            y={23}
                            fontSize={12}
                            className="fill-foreground"
                          >
                            {event.revenue.toLocaleString()} đ
                          </text>
                        </g>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Top 5 sự kiện có doanh thu cao nhất năm 2025{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Hiển thị doanh thu từ 01/01/2025 đến 31/12/2025
            </div>
          </CardFooter>
        </Card>

        {/* Chart events by month */}
        <Card className="w-full">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#4fc9da]">
                Sự Kiện Theo Tháng
              </CardTitle>
              <select
                value={selectedEventsYear}
                onChange={(e) => setSelectedEventsYear(Number(e.target.value))}
                className="border-main rounded border-2 p-2"
              >
                {Array.from(
                  { length: new Date().getFullYear() - 2015 + 1 },
                  (_, i) => 2015 + i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <CardDescription className="-mt-2">
              Chọn năm để xem số sự kiện theo tháng
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {eventsData && eventsData.length > 0 ? (
              <ChartContainer
                id={"events-by-month"}
                config={{
                  completedEvents: {
                    label: "Sự kiện đã kết thúc",
                    color: "#4fc9da",
                  },
                  upcomingEvents: {
                    label: "Sự kiện sắp diễn ra",
                    color: "#57dffb",
                  },
                }}
                className="aspect-square max-h-[300px] w-full"
              >
                <BarChart accessibilityLayer data={eventsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                    tickFormatter={(value) => `Tháng ${value}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickCount={6}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <ChartLegend
                    content={<ChartLegendContent />}
                    align="center"
                    verticalAlign="bottom"
                  />
                  <Bar
                    dataKey="completedEvents"
                    fill="var(--color-completedEvents)"
                    // radius={[10, 10, 0, 0]}
                    radius={10}
                  />
                  <Bar
                    dataKey="upcomingEvents"
                    fill="var(--color-upcomingEvents)"
                    radius={10}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">
                <div className="flex items-center justify-center">
                  <Loading1 isLoading={true} />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Hiển thị số sự kiện theo tháng trong năm {selectedEventsYear}{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Số sự kiện đã kết thúc và sắp diễn ra
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 mb-8 rounded-lg bg-white p-6 shadow">
        <div>
          <h2 className="text-xl font-bold text-[#4fc9da]">Đơn hàng gần đây</h2>
        </div>
        <div className="mt-4 mb-8 overflow-hidden rounded-lg bg-white shadow">
          <div className="">
            <table className="table-layout-fixed w-full max-w-full">
              <thead className="bg-main">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "25%" }}
                  >
                    Người dùng
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "35%" }}
                  >
                    Sự kiện
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "15%" }}
                  >
                    Tổng giá
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "15%" }}
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-medium tracking-wider text-white uppercase"
                    style={{ width: "20%" }}
                  >
                    Ngày mua
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      <div className="inline-flex items-center justify-center">
                        <Loading1 isLoading={true} />
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.createAt} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-normal">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={
                                order.avatarUrl || "/api/placeholder/100/100"
                              }
                              alt="User Avatar"
                            />
                          </div>
                          <div className="ml-3">
                            <div className="line-clamp-1 text-sm font-medium text-gray-900">
                              {order.userName}
                            </div>
                            <div className="line-clamp-1 text-xs text-gray-500">
                              {order.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-normal">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                order.eventImageUrl ||
                                "/api/placeholder/100/100"
                              }
                              alt="Event Image"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="line-clamp-1 text-sm font-medium text-gray-900">
                              {order.eventName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.scheduleDate).toLocaleDateString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )}
                              , {order.startTime.slice(0, 5)} -{" "}
                              {order.endTime.slice(0, 5)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-bold px-3 py-3 text-center text-sm text-green-500">
                        {FormatPrice(order.totalPrice)}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-normal">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                            order.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "CANCELED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-500">
                        {formatDateTime(order.createAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
