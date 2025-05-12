import Loading1 from "@/components/ui/Loading1";
import {
  getAttendanceStatus,
  getComplaintsByReason,
  getDashboardOverview,
  getRevenueByWeek,
  getTicketPaymentStatus,
  getTopTicketsSold,
} from "@/services/user/statisticService";
import { useState, useEffect } from "react";
import { GitCommitVertical, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { se } from "date-fns/locale";
import { FormatPrice } from "@/utils/formatPrice";

const dashboardCards = [
  {
    title: "Tổng sự kiện",
    value: (data) => data.totalEvents,
    colorClass: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    icon: "📊",
  },
  {
    title: "Tổng doanh thu",
    value: (data) => `${FormatPrice(data.totalRevenue)}`,
    colorClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    icon: "💰",
  },
  {
    title: "Tổng vé check in",
    value: (data) => data.totalCheckIns,
    colorClass: "bg-teal-100 text-teal-700 hover:bg-teal-200",
    icon: "✔️",
  },
  {
    title: "Tổng vé bán ra",
    value: (data) => data.totalSoldTickets,
    colorClass: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    icon: "🎟️",
  },
  {
    title: "Sự kiện sắp diễn ra",
    value: (data) => data.upcomingEvents,
    colorClass: "bg-green-100 text-green-700 hover:bg-green-200",
    icon: "📅",
  },
  {
    title: "Sự kiện đã diễn ra",
    value: (data) => data.pastEvents,
    colorClass: "bg-red-100 text-red-700 hover:bg-red-200",
    icon: "⏳",
  },
  {
    title: "Sự kiện bị tạm ẩn",
    value: (data) => data.suspendedEvents,
    colorClass: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    icon: "🚫",
  },
  {
    title: "Tổng phàn nàn ",
    value: (data) => data.totalComplaints,
    colorClass: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    icon: "⚠️",
  },
];

const DashboardOverview = () => {
  const token = localStorage.getItem("token");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topTicketsData, setTopTicketsData] = useState(null);
  const [paymentStatusData, setPaymentStatusData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [complaintsData, setComplaintsData] = useState(null);

  const [revenueData, setRevenueData] = useState(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, topTickets, paymentStatus, attendance, complaints] =
          await Promise.all([
            getDashboardOverview(token),
            getTopTicketsSold(token),
            getTicketPaymentStatus(token),
            getAttendanceStatus(token),
            getComplaintsByReason(token),
          ]);
        setDashboardData(dashboard);
        setTopTicketsData(topTickets);
        setPaymentStatusData(paymentStatus);
        setAttendanceData(attendance);
        setComplaintsData(complaints);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
        console.error("fetchData:", err);
      }
    };
    fetchData();
  }, [token]);
  console.log(selectedMonth, selectedYear);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const revenue = await getRevenueByWeek(
          token,
          selectedYear,
          selectedMonth,
        );
        setRevenueData(revenue);
      } catch (err) {
        console.error("fetchRevenueData:", err);
      }
    };

    fetchRevenueData();
  }, [token, selectedYear, selectedMonth]);

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <Loading1 isLoading={loading} />
      </div>
    );
  if (error)
    return <div className="py-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen">
      <h1 className="font-logo text-main-bold mb-6 text-5xl font-bold">
        DASHBOARD
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg ${card.colorClass} transform p-6 shadow-lg transition-transform hover:scale-105`}
          >
            <div>
              <h2
                className={`text-sm font-medium ${card.colorClass.replace("bg-", "text-").replace("hover:", "")}`}
              >
                {card.title}
              </h2>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {card.value(dashboardData)}
              </p>
            </div>
            <span
              className={`text-3xl ${card.colorClass.replace("bg-", "text-").replace("hover:", "")}`}
            >
              {card.icon}
            </span>
          </div>
        ))}
      </div>

      {/* chart top sold ticket and payment status */}
      <div className="mt-15 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="">
            <CardTitle className="text-lg font-bold text-[#4fc9da]">
              Sự kiện bán vé nhiều nhất
            </CardTitle>
            <CardDescription className="-mt-1">
              Xếp hạng sự kiện theo số lượng vé bán ra
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-3 p-0">
            {topTicketsData && topTicketsData.length > 0 ? (
              <ChartContainer
                id="top-tickets-chart"
                config={{
                  soldTickets: { label: "Tổng vé bán", color: "#ffc966" },
                }}
                className="w-full"
                style={{
                  height: `${
                    topTicketsData.length === 1
                      ? 60
                      : topTicketsData.length === 2
                        ? 110
                        : topTicketsData.length * 45 + 10
                  }px`,
                }}
              >
                <BarChart
                  accessibilityLayer
                  data={topTicketsData}
                  layout="vertical"
                  margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" dataKey="soldTickets" tickCount={5} />
                  <YAxis
                    dataKey="eventName"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={140}
                    tickFormatter={(value) =>
                      value.length > 20 ? `${value.slice(0, 20)}...` : value
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="soldTickets"
                    fill="var(--color-soldTickets)"
                    radius={5}
                    barSize={30}
                    background={{ fill: "transparent" }}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Hiển thị thống kê số lượng vé bán theo sự kiện
            </div>
          </CardFooter>
        </Card>

        {/* Pie chart payment status */}
        <Card className="flex w-full flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg font-bold text-[#4fc9da]">
              Trạng Thái Thanh Toán Vé
            </CardTitle>
            <CardDescription className="-mt-1">
              Thống kê các trạng thái thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent className="-mt-10 flex flex-row items-center justify-center gap-8">
            {paymentStatusData &&
            (paymentStatusData.paid ||
              paymentStatusData.pending ||
              paymentStatusData.canceled) ? (
              <ChartContainer
                id="top-payment-status-chart"
                config={{
                  paid: { label: "Đã thanh toán", color: "#57dffb" },
                  pending: { label: "Chờ thanh toán", color: "#fbff8f" },
                  canceled: { label: "Huỷ thanh toán", color: "#ffad8f" },
                }}
                className="aspect-square max-h-[300px] w-[300px] [&_.recharts-pie-label-text]:fill-black"
              >
                <PieChart width={300} height={300}>
                  <Pie
                    data={[
                      {
                        name: "paid",
                        value: paymentStatusData?.paid || 0,
                        fill: "#57dffb",
                      },
                      {
                        name: "pending",
                        value: paymentStatusData?.pending || 0,
                        fill: "#fbff8f",
                      },
                      {
                        name: "canceled",
                        value: paymentStatusData?.canceled || 0,
                        fill: "#ffad8f",
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ value }) => value}
                    labelLine
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        active={true}
                        payload={[]}
                        hideLabel={true}
                        className="w-[150px] p-2"
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}

            {/* Legend bên phải */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#57dffb]" />
                <span>Đã thanh toán</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#fbff8f]" />
                <span>Chờ thành toán</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#ffad8f]" />
                <span>Huỷ thanh toán</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="-mt-10 flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Hiển thị thống kê trạng thái thanh toán vé
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* line chart revenue by week */}
      <Card className="mt-15 w-full">
        <CardHeader className="">
          <CardTitle className="text-lg font-bold text-[#4fc9da]">
            Doanh Thu Theo Tuần
          </CardTitle>
          <CardDescription className="">
            Chọn tháng và năm để xem doanh thu theo tuần
          </CardDescription>
          <div className="flex gap-4">
            <input
              type="month"
              value={`${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split("-");
                setSelectedYear(Number(year));
                setSelectedMonth(Number(month));
              }}
              className="rounded border p-2"
            />
          </div>
        </CardHeader>
        <CardContent className="">
          {revenueData && revenueData.length > 0 ? (
            <ChartContainer
              id="revenue-by-week-chart"
              config={{
                revenue: {
                  label: "Doanh Thu ",
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
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value.toLocaleString()} VNĐ`}
                  tickCount={5} // số điểm trên trục y
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
                        key={payload.week}
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
            <div className="text-center text-gray-500">No data available</div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Hiển thị doanh thu theo tuần trong tháng {selectedMonth}/
            {selectedYear} <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* chart attendance status and complaint by reason */}
      <div className="mt-15 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Status (RadialBarChart) */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg font-bold text-[#4fc9da]">
              Trạng Thái Check-In
            </CardTitle>
            <CardDescription className="">Thống kê trạng thái check-in</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-0">
            {attendanceData &&
            (attendanceData.checkedIn || attendanceData.notCheckedIn) ? (
              <>
                <ChartContainer
                  id="attendance-status-chart"
                  config={{
                    checkedIn: { label: "Đã Check-In", color: "#57dffb" },
                    notCheckedIn: { label: "Chưa Check-In", color: "#ffad8f" },
                  }}
                  className="mx-auto aspect-square max-h-[200px] w-full max-w-[250px]"
                >
                  <RadialBarChart
                    data={[
                      {
                        checkedIn: attendanceData.checkedIn,
                        notCheckedIn: attendanceData.notCheckedIn,
                      },
                    ]}
                    endAngle={180}
                    innerRadius={80}
                    outerRadius={130}
                  >
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <PolarRadiusAxis
                      tick={false}
                      tickLine={false}
                      axisLine={false}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) - 16}
                                  className="fill-foreground text-2xl font-bold"
                                >
                                  {(
                                    attendanceData.checkedIn +
                                    attendanceData.notCheckedIn
                                  ).toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 4}
                                  className="fill-muted-foreground"
                                >
                                  Vé
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </PolarRadiusAxis>
                    <RadialBar
                      dataKey="checkedIn"
                      stackId="a"
                      cornerRadius={8}
                      fill="#57dffb"
                      className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                      dataKey="notCheckedIn"
                      fill="#ffad8f"
                      stackId="a"
                      cornerRadius={8}
                      className="stroke-transparent stroke-2"
                    />
                  </RadialBarChart>
                </ChartContainer>
                {/* Legend */}
                <div className="-mt-10 flex gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#57dffb]" />
                    <span>Đã Check-In</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#ffad8f]" />
                    <span>Chưa Check-In</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Hiển thị trạng thái check-in
            </div>
          </CardFooter>
        </Card>

        {/* Complaints by Reason (PieChart) */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg font-bold text-[#4fc9da]">
              Phàn Nàn Theo Lý Do
            </CardTitle>
            <CardDescription className="">
              Thống kê lý do phàn nàn
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-center gap-8">
            {complaintsData && complaintsData.length > 0 ? (
              <ChartContainer
                id="complaints-by-reason-chart"
                config={{
                  count: { label: "Số lượng", color: "#57dffb" },
                }}
                className="-mt-5 aspect-square max-h-[210px] w-[210px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={complaintsData.map((item, index) => ({
                      ...item,
                      fill: [
                        "#57dffb",
                        "#fbff8f",
                        "#ffad8f",
                        "#4fff5e",
                        "#ffc966",
                      ][index % 5],
                    }))}
                    dataKey="count"
                    nameKey="reason"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {complaintsData
                                  .reduce((acc, curr) => acc + curr.count, 0)
                                  .toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Phàn nàn
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}

            {/* Custom Legend bên phải */}
            <div className="-mt-5 flex flex-col gap-2">
              {complaintsData &&
                complaintsData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: [
                          "#57dffb",
                          "#fbff8f",
                          "#ffad8f",
                          "#4fff5e",
                          "#ffc966",
                        ][index % 5],
                      }}
                    />
                    <span className="text-sm">{item.reason}</span>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Hiển thị lý do phàn nàn
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
