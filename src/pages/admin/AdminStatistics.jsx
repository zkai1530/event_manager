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
import {
  getCanceledOrderRateByMonth,
  getComplaintCountByReason,
  getOrderStatusCount,
} from "@/services/admin/statisticService";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";

const AdminStatistics = () => {
  const [complaintData, setComplaintData] = useState([]);
  const [cancelRateData, setCancelRateData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYearForOrderStatus, setSelectedYearForOrderStatus] =
    useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaintData = async () => {
      try {
        const response = await getComplaintCountByReason(token);
        const data = response.data;
        const formattedData = Object.keys(data).map((reason) => ({
          reason,
          complaints: data[reason],
        }));
        setComplaintData(formattedData);
      } catch (err) {
        console.error("fetchComplaintData:", err);
      }
    };

    fetchComplaintData();
  }, [token]);

  useEffect(() => {
    const fetchRateData = async () => {
      try {
        const response = await getCanceledOrderRateByMonth(token, selectedYear);
        const data = response;
        const formattedData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          rate: data[String(i + 1)] || 0,
        }));
        setCancelRateData(formattedData);
      } catch (err) {
        console.error("fetchRateData:", err);
      }
    };

    fetchRateData();
  }, [token, selectedYear]);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await getOrderStatusCount(
          token,
          selectedYearForOrderStatus,
          selectedMonth,
        );
        setOrderStatusData(response);
      } catch (err) {
        console.error("fetchStatusData:", err);
      }
    };

    fetchStatusData();
  }, [token, selectedYearForOrderStatus, selectedMonth]);

  const pieData = orderStatusData
    ? [
        { name: "paid", value: orderStatusData.PAID || 0, fill: "#57dffb" },
        {
          name: "pending",
          value: orderStatusData.PENDING || 0,
          fill: "#fbff8f",
        },
        {
          name: "canceled",
          value: orderStatusData.CANCELED || 0,
          fill: "#ffad8f",
        },
      ]
    : [];

  const chartConfig = {
    paid: { label: "Đã thanh toán", color: "#57dffb" },
    pending: { label: "Chờ thanh toán", color: "#fbff8f" },
    canceled: { label: "Hủy thanh toán", color: "#ffad8f" },
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* <header className="bg-[#11e0b1] p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold">Dashboard Quản Trị Viên</h1>
      </header> */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart radar reason complaint */}
        <Card className="w-full">
          <CardHeader className="items-center">
            <CardTitle className="text-lg font-bold text-[#4fc9da]">
              Khiếu Nại Theo Lý Do
            </CardTitle>
            <CardDescription>
              Hiển thị số lượng khiếu nại theo lý do
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            {complaintData && complaintData.length > 0 ? (
              <ChartContainer
                config={{
                  complaints: {
                    label: "Số lượng khiếu nại",
                    color: "#ffc966",
                  },
                }}
                className="mx-auto aspect-square max-h-[250px] w-full"
              >
                <RadarChart data={complaintData}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <PolarAngleAxis
                    dataKey="reason"
                    tickFormatter={(reason) => {
                      if (reason === "Không được check-in dù đã mua vé")
                        return "Không check-in\ndù mua vé";
                      if (reason === "Thông tin sự kiện sai lệch")
                        return "Thông tin\nsai lệch";
                      if (reason === "Sự kiện có dấu hiệu lừa đảo")
                        return "Nghi ngờ\nlừa đảo";
                      if (reason === "Sự kiện không diễn ra")
                        return "Không tổ chức";
                      return reason;
                    }}
                    tick={{ fontSize: 12, fill: "#333" }}
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                  />
                  <PolarGrid />
                  <Radar
                    dataKey="complaints"
                    fill="#57dffb"
                    fillOpacity={0.6}
                    dot={{
                      r: 4,
                      fillOpacity: 1,
                    }}
                  />
                </RadarChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">Không có dữ liệu</div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Số lượng khiếu nại theo lý do <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Chart area cancel order rate */}
        <Card className="w-full">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-[#4fc9da]">
                Tỷ Lệ Hủy Đơn Hàng Theo Tháng
              </CardTitle>
              <CardDescription>
                Chọn năm để xem tỷ lệ hủy đơn hàng theo tháng
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
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
          <CardContent>
            {cancelRateData && cancelRateData.length > 0 ? (
              <ChartContainer
                config={{
                  rate: {
                    label: "Tỷ lệ hủy",
                    color: "#ff0000", // Màu đỏ cho stroke
                  },
                }}
                className="aspect-square max-h-[300px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={cancelRateData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="fillGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ff0000" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#ffffff"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                    // tickFormatter={(value) => `Tháng ${value}`}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                    tickCount={5}
                    // domain={[0, 100]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                  />
                  <Area
                    dataKey="rate"
                    type="linear"
                    fill="url(#fillGradient)"
                    fillOpacity={0.4}
                    stroke="#ff6666"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-gray-500">Không có dữ liệu</div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Tỷ lệ hủy đơn hàng theo tháng trong năm {selectedYear}{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex w-full flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg font-bold text-[#4fc9da]">
              Trạng Thái Đơn Hàng
            </CardTitle>
            <CardDescription className="-mt-1">
              Thống kê trạng thái đơn hàng trong tháng {selectedMonth}/
              {selectedYear}
            </CardDescription>
            <div className="flex gap-4">
              <input
                type="month"
                value={`${selectedYearForOrderStatus}-${selectedMonth.toString().padStart(2, "0")}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-");
                  setSelectedYearForOrderStatus(Number(year));
                  setSelectedMonth(Number(month));
                }}
                className="rounded border p-2"
              />
            </div>
          </CardHeader>
          <CardContent className="-mt-10 flex flex-row items-center justify-center gap-8">
            {orderStatusData &&
            (orderStatusData.PAID ||
              orderStatusData.PENDING ||
              orderStatusData.CANCELED) ? (
              <ChartContainer
                id="order-status-chart"
                config={chartConfig}
                className="aspect-square max-h-[300px] w-[300px] [&_.recharts-pie-label-text]:fill-black"
              >
                <PieChart width={300} height={300}>
                  <Pie
                    data={pieData}
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
              <div className="text-center text-gray-500">Không có dữ liệu</div>
            )}
            {/* legend */}
            <div className="-ml-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#57dffb]" />
                <span>Đã thanh toán</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#fbff8f]" />
                <span>Chờ thanh toán</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#ffad8f]" />
                <span>Hủy thanh toán</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="-mt-10 flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Hiển thị thống kê trạng thái đơn hàng
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatistics;
