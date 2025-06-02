import { useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

const SuccessOrder = () => {
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="flex min-h-screen justify-center bg-white">
      <div className="my-12 w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="bg-green-50 px-8 py-10 text-center">
          <h1 className="text-main-bold mb-3 text-4xl font-bold">
            Xác nhận đặt vé thành công
          </h1>
          <p className="mx-auto max-w-4xl text-lg text-gray-600">
            Cảm ơn bạn đã mua vé trên{" "}
            <span className="font-logo from-main to-emphasis bg-gradient-to-r bg-clip-text text-[22px] font-bold text-transparent">
              Eventify
            </span>
            . Vé điện tử của bạn sẽ được gửi và đính kèm đến email sớm. Vui lòng
            kiểm tra hộp thư đến và làm theo hướng dẫn.
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Ticket Info Header */}
          <div className="mb-8 flex items-center justify-between border-b pb-5">
            <h2 className="text-2xl font-semibold text-gray-800">
              Thông tin xuất vé
            </h2>
            <div className="text-gray-600">
              Mã đơn hàng: <span className="font-medium">#12345</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col gap-10 md:flex-row">
            {/* Left Column - Event Details */}
            <div className="md:w-5/12">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src="https://readdy.ai/api/search-image?query=K-pop%20concert%20poster%20with%20green%20background%2C%20featuring%20multiple%20artists%20arranged%20in%20a%20grid%20layout%2C%20professional%20event%20advertisement%20for%20a%20mega%20concert%20in%20Vietnam%2C%20high%20quality%20promotional%20material&width=600&height=300&seq=1&orientation=landscape"
                  alt="Concert Poster"
                  className="h-56 w-full object-cover object-top"
                />
                <div className="p-6">
                  <h3 className="mb-4 text-2xl font-bold text-gray-800">
                    VPBANK Presents K-STAR SPARK IN VIETNAM - MEGA CONCERT 2025
                  </h3>

                  <div className="mb-4 flex items-start gap-3 text-gray-700">
                    <i className="fas fa-calendar-alt mt-1 text-gray-500"></i>
                    <div>
                      <div className="flex items-center space-x-2 text-lg font-medium">
                        <FaCalendarCheck size={20} className="text-main" />
                        <p>Thứ Bảy, 21/06/2025</p>
                      </div>
                      <div className="text-sm text-gray-500">19:00 - 21:30</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <i className="fas fa-map-marker-alt mt-1 text-gray-500"></i>
                    <div>
                      <div className="flex items-center space-x-2 text-lg font-medium">
                        <FaLocationDot size={20} className="text-main" />
                        <p> SÂN VẬN ĐỘNG QUỐC GIA MỸ ĐÌNH</p>
                      </div>
                      <div className="text-sm">
                        Số 1 Lê Đức Thọ, Mỹ Đình 1, Nam Từ Liêm, Hà Nội
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        My Dinh National Stadium - No. 1 Le Duc Tho Street, My
                        Dinh 1 Ward, Nam Tu Liem District
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer Details */}
            <div className="md:w-7/12">
              {/* Ticket Receipt Section */}
              <div className="space-y-8">
                {/* Email Notification */}
                <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-5">
                  <div className="rounded-full bg-blue-100 p-3 text-blue-500">
                    <i className="fas fa-info"></i>
                  </div>
                  <p className="flex-1 text-gray-700">
                    Nếu sau 10 phút mà bạn chưa nhận được email, click ngay để
                    CTicket gửi lại!
                  </p>
                  <button
                    onClick={handleSendEmail}
                    className="rounded bg-blue-100 px-5 py-2.5 text-blue-600 transition-colors hover:bg-blue-200"
                  >
                    {emailSent ? "Đã gửi" : "Gửi email"}
                  </button>
                </div>

                {/* Customer Information */}
                <div className="rounded-lg border bg-white p-6">
                  <h4 className="mb-4 text-lg font-medium text-gray-800">
                    Thông tin khách hàng
                  </h4>
                  <ul className="space-y-3 text-gray-800">
                    <li className="flex items-center">
                      <span className="mr-3 text-gray-600">•</span>
                      Tên: Pham Minh Anh
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-gray-600">•</span>
                      Email: example@gmail.com
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-gray-600">•</span>
                      Số điện thoại: 09xxxxxxxx
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 text-gray-600">•</span>
                      Ngày sinh: 01/01/1990
                    </li>
                  </ul>
                </div>

                {/* Seating Details */}
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Loại vé
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-5 py-3.5 font-medium text-gray-600">
                            Hạng vé
                          </th>
                          <th className="px-5 py-3.5 text-center font-medium text-gray-600">
                            Số lượng
                          </th>
                          <th className="px-5 py-3.5 text-right font-medium text-gray-600">
                            Giá vé
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-5 py-4 font-medium">
                            CAT 2 R1 SEATING
                          </td>
                          <td className="px-5 py-4 text-center">x3</td>
                          <td className="px-5 py-4 text-right font-medium">
                            2,900,000 VND
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOrder;
