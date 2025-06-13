import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FaCalendarCheck } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FormatPrice } from "@/utils/formatPrice";
import { getSuccessOrderDetails } from "@/services/user/orderService";

const SuccessOrder = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderCode");

  const [orderData, setOrderData] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSuccessOrderDetails = async () => {
      if (!orderId || !token) return;
      try {
        setIsLoading(true);
        const response = await getSuccessOrderDetails(orderId, token)
        setOrderData(response);
      } catch (error) {
        console.error("fetchSuccessOrderDetails :", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuccessOrderDetails();
  }, [orderId, token]);

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex h-screen items-center justify-center">
        Order not found!
      </div>
    );
  }

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
              Mã đơn hàng:{" "}
              <span className="font-medium">#{orderData.orderId}</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            {/* Left Column - Event Details */}
            <div className="md:w-5/12">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={orderData.imageUrl}
                  alt={orderData.eventName}
                  className="h-48 w-full object-cover object-top md:h-64"
                />
                <div className="p-4 md:p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-800 md:mb-4 md:text-2xl">
                    {orderData.eventName}
                  </h3>

                  <div className="mb-3 flex items-start gap-2 text-gray-700 md:mb-4 md:gap-3">
                    <FaCalendarCheck
                      size={16}
                      className="text-main mt-1 md:mt-0.5 md:size-5"
                    />
                    <div>
                      <div className="flex items-center space-x-2 text-base font-medium md:text-lg">
                        <span>
                          {new Date(orderData.scheduleDate).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 md:text-sm">
                        {orderData.startTime} - {orderData.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-gray-700 md:gap-3">
                    <FaLocationDot
                      size={20}
                      className="text-main mt-1 md:mt-0.5 md:size-5"
                    />
                    <div>
                      <div className="text-base font-medium md:text-lg">
                        {orderData.address}
                        {orderData.city !== "Unknown" && (
                          <>, {orderData.city}</>
                        )}
                        , {orderData.country}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Customer Details */}
            <div className="md:w-7/12">
              {/* Email Notification */}
              {/* <div className="flex flex-col items-start gap-3 rounded-lg bg-blue-50 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
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
              </div> */}

              {/* Customer Information */}
              <div className="rounded-lg border bg-white p-4 md:p-6">
                <h4 className="mb-3 text-base font-medium text-gray-800 md:mb-4 md:text-lg">
                  Thông tin khách hàng
                </h4>
                <ul className="space-y-2 text-sm text-gray-800 md:space-y-3 md:text-base">
                  <li className="flex items-center">
                    <span className="mr-2 text-gray-600">•</span>
                    Tên: {orderData.customerName}
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-gray-600">•</span>
                    Email: {orderData.email}
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-gray-600">•</span>
                    Số điện thoại: {orderData.phoneNumber}
                  </li>
                </ul>
              </div>

              {/* Seating Details */}
              <div className="mt-6 md:mt-8">
                <div className="mb-4 flex items-center justify-between md:mb-5">
                  <h3 className="text-lg font-semibold text-gray-800 md:text-xl">
                    Vé đã mua
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
                          Tổng giá vé
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.tickets.map((ticket, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-3 text-sm font-medium md:px-5 md:py-4 md:text-base">
                            {ticket.ticketName}
                            <div className="text-xs text-gray-500">
                              {FormatPrice(ticket.priceAtPurchase)}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-sm md:px-5 md:py-4 md:text-base">
                            x{ticket.quantity}
                          </td>
                          <td className="px-3 py-3 text-right text-sm font-medium md:px-5 md:py-4 md:text-base">
                            {FormatPrice(
                              ticket.priceAtPurchase * ticket.quantity,
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* tổng giá cuối cùng*/}
                      <tr className="border-t font-semibold">
                        <td className="px-3 py-3 md:px-5 md:py-4"></td>{" "}
                        <td className="px-3 py-3 md:px-5 md:py-4"></td>{" "}
                        <td className="px-3 py-3 text-right text-sm text-green-600 md:px-5 md:py-4 md:text-lg">
                          {FormatPrice(
                            orderData.tickets.reduce(
                              (total, ticket) =>
                                total +
                                ticket.priceAtPurchase * ticket.quantity,
                              0,
                            ),
                          )}
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
  );
};

export default SuccessOrder;
