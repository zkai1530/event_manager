import { getEventSummary } from "@/services/admin/eventService";
import { useEffect, useState } from "react";
import { FaBan } from "react-icons/fa";

const EventManagement = () => {
  const [eventSummary, setEventSummary] = useState({
    completedEvents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    ticketSales: 0,
  });
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEventSummary = async () => {
      setIsLoading(true);
      try {
        const data = await getEventSummary(token);
        setEventSummary(data);
      } catch (error) {
        console.error(
          "getEventSummary",
          error?.response?.data || error.message,
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchEventSummary();
    }
  }, [token]);
  return (
    <div className="">
      <div className="mb-8">
        <header className="bg-main p-4 text-white shadow-md">
          <h1 className="text-2xl font-bold">Dashboard Quản Trị Viên</h1>
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
                {eventSummary.totalEvents}
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
                {eventSummary.upcomingEvents}
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
                {eventSummary.completedEvents}
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
                {eventSummary.ticketSales}
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

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Thống kê sự kiện theo thời gian
          </h2>
          <canvas id="eventsChart" height="300"></canvas>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Phân bố sự kiện theo danh mục
          </h2>
          <canvas id="categoriesChart" height="300"></canvas>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên sự kiện..."
                className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-none focus:ring-2 focus:outline-none"
              />
              <i className="fas fa-search absolute top-3 right-3 text-gray-400"></i>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <select className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none">
              <option value="">Tất cả danh mục</option>
              <option value="1">Âm nhạc</option>
              <option value="2">Thể thao</option>
              <option value="3">Giáo dục</option>
              <option value="4">Kinh doanh</option>
              <option value="5">Công nghệ</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none">
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="hidden">Đã ẩn</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sắp xếp theo
            </label>
            <select className="focus:ring-main w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none">
              <option value="date_desc">Mới nhất</option>
              <option value="date_asc">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="tickets">Lượt bán vé</option>
            </select>
          </div>
        </div>
        <div className="mt-4 mb-4 flex justify-end">
          <button className="bg-main hover:bg-main-bold flex cursor-pointer items-center rounded-lg px-4 py-2 text-white transition duration-300">
            Lọc kết quả
          </button>
        </div>

        {/* <!-- Danh sách sự kiện dạng bảng --> */}
        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-hidden">
            <table className="table-layout-fixed w-full max-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
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
                    className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
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
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
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
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
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
                    className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    style={{ width: "10%" }}
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
                    className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                    style={{ width: "10%" }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src="/api/placeholder/100/100"
                          alt="Thumbnail"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="line-clamp-1 text-sm font-medium text-gray-900">
                          #1001 - Âm nhạc Festival 2025a năm mớ phat tài phác
                          lộc nheoes
                        </div>
                        <div className="text-xs text-gray-500">
                          Công ty Sự kiện XYZ
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center whitespace-normal">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs leading-5 font-semibold text-blue-800">
                      Âm nhạc
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center whitespace-normal">
                    <div className="text-sm text-gray-900">TP. Hồ Chí Minh</div>
                    <div className="text-xs text-gray-500">
                      Công viên 23/9, Quận 1
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="mr-2 h-2.5 w-30 rounded-full bg-gray-200">
                        <div
                          className="h-2.5 rounded-full bg-blue-600"
                          style={{ width: `${(548 / 1000) * 100}%` }}
                        ></div>
                      </div>
                      <span>548/1000</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs leading-5 font-semibold text-green-800">
                      Đang diễn ra
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-medium whitespace-normal">
                    <div className="flex items-center justify-center">
                      <button className="cursor-pointer rounded-sm bg-red-100 p-2">
                        <FaBan size={18} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src="/api/placeholder/100/100"
                          alt="Thumbnail"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          #1002 - Tech Conference 2025
                        </div>
                        <div className="text-sm text-gray-500">
                          Người tổ chức: Tech Community Vietnam
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs leading-5 font-semibold text-purple-800">
                      Công nghệ
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="text-sm text-gray-900">Hà Nội</div>
                    <div className="text-xs text-gray-500">
                      Trung tâm Hội nghị Quốc gia
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                    <div className="flex items-center">
                      <div className="mr-2 h-2.5 w-full rounded-full bg-gray-200">
                        <div className="h-2.5 w-[55%] rounded-full bg-blue-600"></div>
                      </div>
                      <span>325/700</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs leading-5 font-semibold text-yellow-800">
                      Sắp diễn ra
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-medium whitespace-normal">
                    <button className="mr-3 text-blue-600 hover:text-blue-900">
                      <i className="fas fa-eye mr-1"></i> Chi tiết
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <i className="fas fa-eye-slash mr-1"></i> Ẩn
                    </button>
                  </td>
                </tr>

                <tr className="bg-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover opacity-60"
                          src="/api/placeholder/100/100"
                          alt="Thumbnail"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          #1003 - Hội chợ Ẩm thực Quốc tế
                        </div>
                        <div className="text-sm text-gray-500">
                          Người tổ chức: Hiệp hội Ẩm thực
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-red-100 px-2 text-xs leading-5 font-semibold text-red-800">
                      Ẩm thực
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="text-sm text-gray-900">Đà Nẵng</div>
                    <div className="text-xs text-gray-500">
                      Cung Thể thao Tiên Sơn
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                    <div className="flex items-center">
                      <div className="mr-2 h-2.5 w-full rounded-full bg-gray-200">
                        <div className="h-2.5 w-[0%] rounded-full bg-blue-600"></div>
                      </div>
                      <span>0/800</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs leading-5 font-semibold text-gray-800">
                      Đã ẩn
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-medium whitespace-normal">
                    <button className="mr-3 text-blue-600 hover:text-blue-900">
                      <i className="fas fa-eye mr-1"></i> Chi tiết
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <i className="fas fa-eye mr-1"></i> Hiện
                    </button>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src="/api/placeholder/100/100"
                          alt="Thumbnail"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          #1004 - Hội thảo Khởi nghiệp 2025
                        </div>
                        <div className="text-sm text-gray-500">
                          Người tổ chức: Startup Vietnam
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-orange-100 px-2 text-xs leading-5 font-semibold text-orange-800">
                      Kinh doanh
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <div className="text-sm text-gray-900">TP. Hồ Chí Minh</div>
                    <div className="text-xs text-gray-500">
                      Trung tâm Hội nghị White Palace
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm whitespace-normal text-gray-500">
                    <div className="flex items-center">
                      <div className="mr-2 h-2.5 w-full rounded-full bg-gray-200">
                        <div className="h-2.5 w-[0%] rounded-full bg-blue-600"></div>
                      </div>
                      <span>0/800</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-normal">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs leading-5 font-semibold text-gray-800">
                      Đã ẩn
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-medium whitespace-normal">
                    <button className="mr-3 text-blue-600 hover:text-blue-900">
                      <i className="fas fa-eye mr-1"></i> Chi tiết
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <i className="fas fa-eye mr-1"></i> Hiện
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
