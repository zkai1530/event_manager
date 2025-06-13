import {
  getOrderStatus,
  getOrderByOrderId,
  createPaymentLink,
  cancelOrder,
} from "@/services/user/orderService";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousPath, setPreviousPath] = useState("/");
  const [isNavigating, setIsNavigating] = useState(false); // Flag để tránh lặp

  const location = useLocation();
  const navigate = useNavigate();
  const { slug, orderId } = useParams();
  const token = localStorage.getItem("token");

  // Lấy thông tin đơn hàng từ API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId && token && !persistedState) {
        try {
          setIsLoading(true);
          const response = await getOrderByOrderId(orderId, token);
          if (response && response.data) {
            setPersistedState(response.data);
            setPreviousPath(document.referrer || "/");
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Không thể lấy thông tin đơn hàng. Vui lòng thử lại!",
              icon: "error",
              confirmButtonText: "OK",
            }).then(() => navigate("/"));
          }
        } catch (error) {
          console.error("Error fetching order details:", error);
          Swal.fire({
            title: "Lỗi!",
            text: "Có lỗi khi lấy thông tin đơn hàng. Vui lòng thử lại!",
            icon: "error",
            confirmButtonText: "OK",
          }).then(() => navigate("/"));
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchOrderDetails();
  }, [orderId, token, navigate, persistedState]);

  // Khởi tạo thời gian từ API getOrderStatus
  useEffect(() => {
    let isMounted = true;
    const fetchOrderStatus = async () => {
      if (orderId && token && !isInitialized) {
        try {
          setIsLoading(true);
          const response = await getOrderStatus(orderId, token);
          console.log("Order status response:", response);
          if (
            isMounted &&
            response.data &&
            response.data.remainingTimeSeconds !== undefined
          ) {
            const remaining = response.data.remainingTimeSeconds;
            setMinutes(Math.floor(remaining / 60));
            setSeconds(remaining % 60);
            setIsInitialized(true);
          } else if (isMounted) {
            Swal.fire({
              title: "Lỗi!",
              text: "Đơn hàng không còn hiệu lực hoặc đã hết thời gian!",
              icon: "error",
              confirmButtonText: "OK",
            }).then(() => navigate("/"));
          }
        } catch (error) {
          console.error("Error fetching order status:", error);
          if (isMounted) {
            Swal.fire({
              title: "Lỗi!",
              text: "Không thể kiểm tra trạng thái đơn hàng. Vui lòng thử lại!",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }
    };
    fetchOrderStatus();
    return () => {
      isMounted = false;
    };
  }, [orderId, token, navigate, isInitialized]);

  // Đếm ngược thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1);
      } else if (minutes > 0) {
        setMinutes((prevMinutes) => prevMinutes - 1);
        setSeconds(59);
      } else {
        clearInterval(timer);
        if (orderId && token) {
          cancelOrder(orderId, token)
            .then(() => {
              Swal.fire({
                title: "Hết thời gian!",
                text: "Đơn hàng không còn hiệu lực hoặc đã hết thời gian!",
                icon: "error",
                confirmButtonText: "OK",
              }).then(() => {
                navigate("/");
              });
            })
            .catch((error) => {
              console.error("Error canceling order on timeout:", error);
              Swal.fire({
                title: "Lỗi!",
                text: "Không thể hủy đơn. Vui lòng thử lại!",
                icon: "error",
                confirmButtonText: "OK",
              }).then(() => navigate("/"));
            });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds, navigate]);

  // Xử lý trước khi rời trang (navigation và beforeunload)
  useEffect(() => {
    const currentPath = location.pathname;

    // Lưu trữ hàm gốc
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Override pushState và replaceState để bắt navigation
    const handleNavigation = async (event) => {
      if (isNavigating || !(minutes > 0 || seconds > 0)) {
        // Nếu đang navigating hoặc hết thời gian, cho phép
        if (event.state && event.state.url) {
          navigate(event.state.url);
        }
        return;
      }

      event.preventDefault(); // Ngăn hành động mặc định
      const result = await Swal.fire({
        title: "Bạn có muốn rời khỏi trang?",
        text: "Rời khỏi trang sẽ hủy đơn đặt vé hiện tại!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hủy đơn",
        cancelButtonText: "Ở lại",
        reverseButtons: true,
      });
      if (result.isConfirmed && orderId && token) {
        try {
          setIsNavigating(true); // Đánh dấu đang navigating
          await cancelOrder(orderId, token);
          // Sử dụng navigate để chuyển trang
          if (event.state && event.state.url) {
            navigate(event.state.url);
          } else if (event.type === "popstate") {
            window.history.back(); // Quay lại nếu là popstate
          }
        } catch (error) {
          console.error("Error canceling order:", error);
          Swal.fire({
            title: "Lỗi!",
            text: "Không thể hủy đơn. Vui lòng thử lại!",
            icon: "error",
            confirmButtonText: "OK",
          });
        } finally {
          setIsNavigating(false); // Reset flag
        }
      }
      // Không làm gì nếu chọn "Ở lại", chặn navigation
    };

    // Override pushState
    window.history.pushState = function (state, title, url) {
      if (currentPath !== url && (minutes > 0 || seconds > 0)) {
        handleNavigation({
          state: { url },
          type: "pushState",
          preventDefault: () => {},
        });
      } else {
        originalPushState.apply(this, [state, title, url]);
      }
    };

    // Override replaceState
    window.history.replaceState = function (state, title, url) {
      if (currentPath !== url && (minutes > 0 || seconds > 0)) {
        handleNavigation({
          state: { url },
          type: "replaceState",
          preventDefault: () => {},
        });
      } else {
        originalReplaceState.apply(this, [state, title, url]);
      }
    };

    // Xử lý popstate (back/forward)
    const handlePopState = (event) => {
      if (minutes > 0 || seconds > 0) {
        event.preventDefault(); // Ngăn hành động mặc định
        handleNavigation({ type: "popstate" });
      }
    };
    window.addEventListener("popstate", handlePopState);

    // Xử lý beforeunload (đóng tab)
    const handleBeforeUnload = (event) => {
      if (minutes > 0 || seconds > 0) {
        event.preventDefault();
        event.returnValue = ""; // Yêu cầu xác nhận
        Swal.fire({
          title: "Bạn có muốn rời khỏi trang?",
          text: "Rời khỏi trang sẽ hủy đơn đặt vé hiện tại!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hủy đơn",
          cancelButtonText: "Ở lại",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed && orderId && token) {
            cancelOrder(orderId, token)
              .then(() => {
                navigate(previousPath);
              })
              .catch((error) => {
                console.error("Error canceling order:", error);
                Swal.fire({
                  title: "Lỗi!",
                  text: "Không thể hủy đơn. Vui lòng thử lại!",
                  icon: "error",
                  confirmButtonText: "OK",
                });
              });
          }
        });
      }
    };

    window.onbeforeunload = handleBeforeUnload;

    // Cleanup
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.onbeforeunload = null;
    };
  }, [
    minutes,
    seconds,
    orderId,
    token,
    navigate,
    location.pathname,
    previousPath,
    isNavigating,
  ]);

  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  const calculateTicketPrice = (ticket, discountIds) => {
    let price = ticket.priceAtPurchase || 0;
    const discounts =
      (persistedState?.tickets || []).find(
        (t) => t.ticketName === ticket.ticketName,
      )?.discounts || [];
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

    if (persistedState?.tickets) {
      persistedState.tickets.forEach(
        ({ ticketName, quantity, priceAtPurchase }) => {
          const ticket = { ticketName, priceAtPurchase };
          const discountedPrice = calculateTicketPrice(ticket, []);
          subtotal += discountedPrice * quantity;
          totalTickets += quantity;
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

    if (!persistedState) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không có thông tin vé để thanh toán!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await createPaymentLink(orderId, token);
      if (response && response.data) {
        window.open(response.data, "_blank");
        navigate("/"); // Sử dụng navigate gốc
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể tạo link thanh toán. Vui lòng thử lại!",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Có lỗi khi tạo link thanh toán. Vui lòng thử lại!",
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
      {/* Header Section (giả sử có header riêng, không cần sửa nếu dùng navigate) */}
      <div className="relative border-b border-gray-200 px-4 py-8">
        <div className="absolute inset-0">
          <img
            src={
              persistedState?.imageUrl || "https://via.placeholder.com/1200x300"
            }
            alt="Event Background"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold text-white drop-shadow-md">
            {persistedState?.eventName || "Sự kiện không xác định"}
          </h1>
          <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
            <div className="flex-1">
              <div className="mb-3 flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2 text-green-300"></i>
                <div>
                  <div className="font-medium text-white">
                    {persistedState?.city || "Địa điểm không xác định"}
                  </div>
                  <div className="text-sm text-gray-200">
                    {persistedState?.address || ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <i className="far fa-calendar-alt mr-2 text-green-300"></i>
                <span className="text-white">
                  {persistedState?.startTime} - {persistedState?.endTime},{" "}
                  {persistedState?.scheduleDate}
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:mt-0">
              <div className="mb-2 text-center text-sm text-gray-600">
                Đặt vé hết hạn trong
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-main-bold text-xl font-bold text-white">
                  {formatNumber(minutes)}
                </div>
                <div className="text-xl font-bold">:</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-main-bold text-xl font-bold text-white">
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
            <h2 className="mb-6 text-xl font-bold text-main-bold">
              THÔNG TIN NGƯỜI MUA
            </h2>
            <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-md">
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setExpanded(!expanded)}
              >
                <h3 className="font-medium text-main-bold">
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
                    <div className="mb-4">
                      <label className="mb-1 mt-4 block">
                        <span className="text-red-500">*</span> Email
                      </label>
                      <input
                        type="email"
                        className="w-full rounded border border-gray-300 bg-gray-50 p-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        value={email || persistedState?.email || ""}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="lykhanh2303@gmail.com"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block">
                        <span className="text-red-500">*</span> Họ và tên
                      </label>
                      <input
                        type="tel"
                        className="w-full rounded border border-gray-300 bg-gray-50 p-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                        value={phone || persistedState?.customerName || ""}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ly Khanh"
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
                        value={phone || persistedState?.phoneNumber || ""}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0123456789"
                        required
                      />
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
                {persistedState?.tickets?.map(
                  ({ ticketName, quantity, priceAtPurchase }) => (
                    <div key={ticketName} className="mb-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{ticketName}</span>
                        <span>x{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span></span>
                        <span>
                          {(priceAtPurchase * quantity).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                      </div>
                    </div>
                  ),
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
                className="mt-4 w-full rounded-lg bg-main px-4 py-3 font-medium text-white hover:bg-main-bold disabled:bg-gray-400"
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
