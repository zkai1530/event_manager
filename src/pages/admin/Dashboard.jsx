import React, { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      if (card instanceof HTMLElement) {
        card.style.opacity = "0";
        setTimeout(() => {
          card.style.transition = "opacity 0.5s ease-in-out";
          card.style.opacity = "1";
        }, index * 200);
      }
    });
  }, []);   

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-main p-4 text-white shadow-md">
        <h1 className="text-2xl font-bold">Dashboard Quản Trị Viên</h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Section: Thống kê tổng quan (Cards) */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Tổng số sự kiện */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">Tổng số sự kiện</h2>
            <p className="text-3xl font-bold text-gray-800">123</p>
            <p>(Số sự kiện đang quản lý)</p>
          </div>

          {/* Card 2: Tổng khiếu nại */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">Tổng khiếu nại</h2>
            <p className="text-3xl font-bold text-gray-800">45</p>
            <p>(Số khiếu nại chưa xử lý)</p>
          </div>

          {/* Card 3: Doanh thu giải ngân */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">Doanh thu giải ngân</h2>
            <p className="text-3xl font-bold text-gray-800">$50,000</p>
            <p>(Tổng tiền đã giải ngân)</p>
          </div>

          {/* Card 4: Tài khoản bị khóa */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">Tài khoản bị khóa</h2>
            <p className="text-3xl font-bold text-gray-800">15</p>
            <p>(Số tài khoản vi phạm)</p>
          </div>

          {/* Card 5: Check-in tổng */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">Check-in tổng</h2>
            <p className="text-3xl font-bold text-gray-800">80%</p>
            <p>(Tỷ lệ check-in trung bình)</p>
          </div>

          {/* Card 6: Sự kiện gian lận */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-semibold">Sự kiện gian lận</h2>
            <p className="text-3xl font-bold text-gray-800">5</p>
            <p>(Số sự kiện bị nghi gian lận)</p>
          </div>
        </div>

        {/* Section: Biểu đồ chi tiết (Các card riêng) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Biểu đồ sự kiện */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Tỷ lệ sự kiện</h2>
            <p>
              Chart: Biểu đồ tròn (Pie Chart) - Hiển thị tỷ lệ sự kiện đang diễn
              ra, đã kết thúc, và bị tạm ẩn.
            </p>
          </div>

          {/* Card 2: Biểu đồ khiếu nại */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Thống kê khiếu nại</h2>
            <p>
              Chart: Biểu đồ cột (Bar Chart) - Hiển thị số lượng khiếu nại theo
              ngày hoặc sự kiện.
            </p>
          </div>

          {/* Card 3: Biểu đồ doanh thu */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Doanh thu giải ngân</h2>
            <p>
              Chart: Biểu đồ đường (Line Chart) - Hiển thị tổng tiền giải ngân
              theo thời gian (theo tháng/năm).
            </p>
          </div>

          {/* Card 4: Biểu đồ gian lận */}
          <div className="card rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Phát hiện gian lận</h2>
            <p>
              Chart: Biểu đồ nhiệt (Heatmap) - Hiển thị tỷ lệ gian lận theo sự
              kiện hoặc thời gian.
            </p>
          </div>
        </div>

        {/* Section: Danh sách hành động */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Hành động nhanh</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p>Button: Xem danh sách sự kiện đủ điều kiện giải ngân</p>
            </div>
            <div>
              <p>Button: Xem danh sách khiếu nại</p>
            </div>
            <div>
              <p>Button: Quản lý tài khoản người dùng</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
