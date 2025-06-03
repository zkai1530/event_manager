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
      <div className="my-30 w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-lg md:my-8">
        {/* Header */}
        <div className="bg-green-50 px-4 py-6 text-center md:px-8 md:py-10">
          <h1 className="text-main-bold font-main mb-2 text-2xl font-bold md:mb-3 md:text-4xl">
            Xác nhận đặt vé thành công
          </h1>
          <p className="mx-auto max-w-3xl text-base text-gray-600 md:max-w-4xl md:text-lg">
            Cảm ơn bạn đã mua vé trên{" "}
            <span className="font-logo from-main to-emphasis bg-gradient-to-r bg-clip-text text-[18px] font-bold text-transparent md:text-[22px]">
              Eventify
            </span>
            . Vé điện tử của bạn sẽ được gửi và đính kèm đến email sớm. Vui lòng
            kiểm tra hộp thư đến và làm theo hướng dẫn.
          </p>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-8">
          {/* Ticket Info Header */}
          <div className="mb-6 flex items-center justify-between border-b pb-3 md:mb-8 md:pb-5">
            <h2 className="text-lg font-semibold text-gray-800 md:text-2xl">
              Thông tin xuất vé
            </h2>
            <div className="text-sm text-gray-600 md:text-base">
              Mã đơn hàng: <span className="font-medium">#12345</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            {/* Left Column - Event Details */}
            <div className="md:w-5/12">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src="https://salt.tkbcdn.com/ts/ds/87/43/e3/7e239ba463207db6e0e12cee4e433536.jpg"
                  alt="Concert Poster"
                  className="h-48 w-full object-cover object-top md:h-64"
                />
                <div className="p-4 md:p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-800 md:mb-4 md:text-2xl">
                    VPBANK Presents K-STAR SPARK IN VIETNAM - MEGA CONCERT 2025
                  </h3>

                  <div className="mb-3 flex items-start gap-2 text-gray-700 md:mb-4 md:gap-3">
                    <FaCalendarCheck
                      size={16}
                      className="text-main mt-1 md:mt-0.5 md:size-5"
                    />
                    <div>
                      <div className="flex items-center space-x-2 text-base font-medium md:text-lg">
                        <span>Thứ Bảy, 21/06/2025</span>
                      </div>
                      <div className="text-xs text-gray-500 md:text-sm">
                        19:00 - 21:30
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-gray-700 md:gap-3">
                    <FaLocationDot
                      size={16}
                      className="text-main mt-1 md:mt-0.5 md:size-5"
                    />
                    <div>
                      <div className="text-base font-medium md:text-lg">
                        SÂN VẬN ĐỘNG QUỐC GIA MỸ ĐÌNH
                      </div>
                      <div className="text-xs md:text-sm">
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
              <div className="space-y-6 md:space-y-8">
                {/* Email Notification */}
                <div className="flex flex-col items-start gap-3 rounded-lg bg-blue-50 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
                  <div className="rounded-full bg-blue-100 p-2.5 text-blue-500">
                    <i className="fas fa-info"></i>
                  </div>
                  <p className="flex-1 text-sm text-gray-700 md:text-base">
                    Nếu sau 10 phút mà bạn chưa nhận được email, click ngay để
                    CTicket gửi lại!
                  </p>
                  <button
                    onClick={handleSendEmail}
                    className="w-full rounded bg-blue-100 px-4 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-200 md:w-auto md:px-5 md:py-2.5 md:text-base"
                  >
                    {emailSent ? "Đã gửi" : "Gửi email"}
                  </button>
                </div>

                {/* Customer Information */}
                <div className="rounded-lg border bg-white p-4 md:p-6">
                  <h4 className="mb-3 text-base font-medium text-gray-800 md:mb-4 md:text-lg">
                    Thông tin khách hàng
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-800 md:space-y-3 md:text-base">
                    <li className="flex items-center">
                      <span className="mr-2 text-gray-600">•</span>
                      Tên: Pham Minh Anh
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-gray-600">•</span>
                      Email: example@gmail.com
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-gray-600">•</span>
                      Số điện thoại: 09xxxxxxxx
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-gray-600">•</span>
                      Ngày sinh: 01/01/1990
                    </li>
                  </ul>
                </div>

                {/* Seating Details */}
                <div>
                  <div className="mb-4 flex items-center justify-between md:mb-5">
                    <h3 className="text-lg font-semibold text-gray-800 md:text-xl">
                      Loại vé
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-green-100 text-left">
                          <th className="px-3 py-2 text-sm font-medium text-gray-600 md:px-5 md:py-3.5 md:text-base">
                            Hạng vé
                          </th>
                          <th className="px-3 py-2 text-center text-sm font-medium text-gray-600 md:px-5 md:py-3.5 md:text-base">
                            Số lượng
                          </th>
                          <th className="px-3 py-2 text-right text-sm font-medium text-gray-600 md:px-5 md:py-3.5 md:text-base">
                            Giá vé
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-3 text-sm font-medium md:px-5 md:py-4 md:text-base">
                            CAT 2 R1 SEATING
                          </td>
                          <td className="px-3 py-3 text-center text-sm md:px-5 md:py-4 md:text-base">
                            x3
                          </td>
                          <td className="px-3 py-3 text-right text-sm font-medium md:px-5 md:py-4 md:text-base">
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
