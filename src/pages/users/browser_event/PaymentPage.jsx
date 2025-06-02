import { createOrder } from "@/services/user/orderService";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const PaymentPage = () => {
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState("Flower 1969's");
  const [persistedState, setPersistedState] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { checkoutData, eventInfo } = location.state || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (checkoutData || eventInfo) {
      setPersistedState({ checkoutData, eventInfo });
    }
  }, [checkoutData, eventInfo]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1);
      } else if (minutes > 0) {
        setMinutes((prevMinutes) => prevMinutes - 1);
        setSeconds(59);
      } else {
        clearInterval(timer);
        Swal.fire({
          title: "Hết thời gian!",
          text: "Thời gian đặt vé đã hết. Vui lòng chọn lại vé!",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/"); // Điều hướng về trang chủ
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (minutes > 0 || seconds > 0) {
        event.preventDefault();
        event.returnValue =
          "Bạn có muốn rời khỏi trang? Rời khỏi sẽ hủy đơn đặt vé!";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [minutes, seconds]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    let isNavigating = false; // Cờ để ngăn vòng lặp popstate

    const handlePopState = () => {
      if (isNavigating) return; // Ngăn gọi lại nếu đang điều hướng

      if (minutes > 0 || seconds > 0) {
        Swal.fire({
          title: "Bạn có muốn rời khỏi trang?",
          text: "Rời khỏi trang sẽ hủy đơn đặt vé hiện tại!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hủy đơn",
          cancelButtonText: "Ở lại",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            isNavigating = true; // Đặt cờ để ngăn popstate lặp lại
            navigate(-1); // Quay lại trang trước
          } else {
            window.history.pushState(null, null, window.location.href); // Đẩy lại trạng thái để chặn lần sau
          }
        });
      } else {
        isNavigating = true; // Đặt cờ để ngăn popstate
        navigate(-1); // Cho phép quay lại nếu hết thời gian
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, minutes, seconds]);

  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  const calculateTicketPrice = (ticket, discountIds) => {
    let price = ticket.price;
    const discounts = ticket.discounts.filter((d) =>
      discountIds.includes(d.discountId),
    );

    discounts.forEach((discount) => {
      if (discount.discountType === "PERCENT") {
        price = price * (1 - discount.discountValue / 100);
      } else if (discount.discountType === "FIXED") {
        price = price - discount.discountValue;
      }
    });

    return Math.max(0, price);
  };

  const calculateSummary = () => {
    let subtotal = 0;
    let totalTickets = 0;

    if (persistedState?.checkoutData && persistedState?.eventInfo) {
      persistedState.checkoutData.tickets.forEach(
        ({ ticketId, quantity, discountIds }) => {
          const ticket = persistedState.eventInfo.tickets.find(
            (t) => t.id === ticketId,
          );
          if (ticket) {
            const discountedPrice = calculateTicketPrice(ticket, discountIds);
            subtotal += discountedPrice * quantity;
            totalTickets += quantity;
          }
        },
      );
    }

    return { subtotal, totalTickets };
  };

  const handleCheckout = async () => {
    if (!email || !phone) {
      Swal.fire({
        title: "Cảnh báo!",
        text: "Vui lòng điền đầy đủ email và số điện thoại!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!persistedState?.checkoutData) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không có thông tin vé để thanh toán!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    console.log(
      "Checkout data for current backend:",
      persistedState.checkoutData,
    );
    try {
      setIsLoading(true);
      const data = await createOrder(persistedState.checkoutData, token);
      if (data) {
        window.open(data, "_blank");
        navigate("/");
      }
    } catch (error) {
      console.error("Create order error:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { subtotal, totalTickets } = calculateSummary();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header Section */}
      <div className="relative border-b border-gray-200 px-4 py-8">
        <div className="absolute inset-0">
          <img
            src={
              persistedState?.eventInfo?.imageUrl ||
              "https://via.placeholder.com/1200x300"
            }
            alt="Event Background"
            className="h-full w-full object-cover opacity-20" // Giảm opacity từ 30 xuống 20
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold text-white drop-shadow-md">
            {persistedState?.eventInfo?.name || "Sự kiện không xác định"}
          </h1>
          <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
            <div className="flex-1">
              <div className="mb-3 flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2 text-green-300"></i>
                <div>
                  <div className="font-medium text-white">
                    {persistedState?.eventInfo?.location?.name ||
                      "Địa điểm không xác định"}
                  </div>
                  <div className="text-sm text-gray-200">
                    {persistedState?.eventInfo?.location?.address || ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <i className="far fa-calendar-alt mr-2 text-green-300"></i>
                <span className="text-white">
                  {persistedState?.eventInfo?.time} -{" "}
                  {persistedState?.eventInfo?.date}
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:mt-0">
              <div className="mb-2 text-center text-sm text-gray-600">
                Đặt vé hết hạn trong
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-xl font-bold text-white">
                  {formatNumber(minutes)}
                </div>
                <div className="text-xl font-bold">:</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-500 text-xl font-bold text-white">
                  {formatNumber(seconds)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Questionnaire Section */}
          <div className="flex-1">
            <h2 className="mb-6 text-xl font-bold text-green-600">
              THÔNG TIN NGƯỜI MUA
            </h2>
            <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-md">
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setExpanded(!expanded)}
              >
                <h3 className="font-medium text-green-600">
                  Thông tin liên hệ
                </h3>
                <button className="text-gray-400">
                  {expanded ? (
                    <i className="fas fa-minus-circle"></i>
                  ) : (
                    <i className="fas fa-plus-circle"></i>
                  )}
                </button>
              </div>
              {expanded && (
                <div className="border-t border-gray-200 p-4 pt-0">
                  <div className="mb-4">
                    <h4 className="mb-2 font-medium">Thông tin bổ sung</h4>
                    <div className="mb-4">
                      <label className="mb-1 block">
                        <span className="text-red-500">*</span> Email
                      </label>
                      <input
                        type="email"
                        className="w-full rounded border border-gray-300 bg-gray-50 p-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block">
                        <span className="text-red-500">*</span> Số điện thoại
                      </label>
                      <input
                        type="tel"
                        className="w-full rounded border border-gray-300 bg-gray-50 p-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0123456789"
                        required
                      />
                    </div>
                    <div>
                      <p className="mb-2">
                        Bạn biết đến workshop của chúng tôi qua đâu?
                      </p>
                      <div className="space-y-2">
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="workshop"
                            className="form-radio text-green-500 focus:ring-0"
                            checked={selectedWorkshop === "Flower 1969's"}
                            onChange={() =>
                              setSelectedWorkshop("Flower 1969's")
                            }
                          />
                          <span className="ml-2">Flower 1969's</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="workshop"
                            className="form-radio text-green-500 focus:ring-0"
                            checked={selectedWorkshop === "Ticket Box"}
                            onChange={() => setSelectedWorkshop("Ticket Box")}
                          />
                          <span className="ml-2">Ticket Box</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                          <input
                            type="radio"
                            name="workshop"
                            className="form-radio text-green-500 focus:ring-0"
                            checked={selectedWorkshop === "The Seat Cafe"}
                            onChange={() =>
                              setSelectedWorkshop("The Seat Cafe")
                            }
                          />
                          <span className="ml-2">The Seat Cafe</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Ticket Summary */}
          <div className="lg:w-96">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-bold text-gray-800">
                Tóm tắt đơn hàng
              </h3>
              <div className="mb-4 border-b border-gray-200 pb-4">
                {checkoutData?.tickets?.map(
                  ({ ticketId, quantity, discountIds }) => {
                    const ticket = eventInfo?.tickets?.find(
                      (t) => t.id === ticketId,
                    );
                    if (!ticket) return null;
                    const discountedPrice = calculateTicketPrice(
                      ticket,
                      discountIds,
                    );
                    const discounts = ticket.discounts.filter((d) =>
                      discountIds.includes(d.discountId),
                    );
                    return (
                      <div key={ticketId} className="mb-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{ticket.name}</span>
                          <span>x{quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            {discounts.length > 0
                              ? `${(ticket.price * quantity).toLocaleString("vi-VN")} ₫`
                              : ""}
                          </span>
                          <span>
                            {(discountedPrice * quantity).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            ₫
                          </span>
                        </div>
                        {discounts.map((discount) => (
                          <div
                            key={discount.discountId}
                            className="text-sm text-green-600"
                          >
                            {discount.promoCode
                              ? `Mã ${discount.promoCode}: `
                              : "Giảm giá tự động: "}
                            {discount.discountType === "PERCENT"
                              ? `${discount.discountValue}%`
                              : `${discount.discountValue.toLocaleString("vi-VN")} ₫`}
                          </div>
                        ))}
                      </div>
                    );
                  },
                )}
              </div>
              <div className="flex justify-between font-bold text-gray-800">
                <span>Tổng cộng ({totalTickets} vé)</span>
                <span className="text-green-600">
                  {subtotal.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Vui lòng hoàn thành thông tin để tiếp tục thanh toán
              </div>
              <button
                className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Thanh toán"}
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
