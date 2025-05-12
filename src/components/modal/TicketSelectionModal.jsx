import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { IoCloseSharp } from "react-icons/io5";
import { createOrder } from "services/user/orderService";
import Loading from "@/components/ui/Loading";
import Swal from "sweetalert2";

const TicketSelectionModal = ({
  eventInfo,
  selectedSchedule,
  closeModal,
  calculateDiscountedPrice,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [quantities, setQuantities] = useState(
    eventInfo.tickets.reduce((acc, ticket) => {
      acc[ticket.id] = 0;
      return acc;
    }, {}),
  );

  const [promoCodes, setPromoCodes] = useState(
    eventInfo.tickets.reduce((acc, ticket) => {
      acc[ticket.id] = { code: "", appliedDiscount: null };
      return acc;
    }, {}),
  );

  // Ngăn cuộn trang phía sau khi mở modal
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleQuantityChange = (ticketId, delta) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, prev[ticketId] + delta);
      return { ...prev, [ticketId]: newQuantity };
    });
  };

  const handlePromoCodeChange = (ticketId, code) => {
    setPromoCodes((prev) => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], code },
    }));
  };

  const applyPromoCode = (ticketId) => {
    const ticket = eventInfo.tickets.find((t) => t.id === ticketId);
    const promoCode = promoCodes[ticketId].code;
    const discount = ticket.discounts.find((d) => d.promoCode === promoCode);

    if (discount && discount.promoCode !== null) {
      setPromoCodes((prev) => ({
        ...prev,
        [ticketId]: { code: discount.promoCode, appliedDiscount: discount },
      }));
    } else {
      Swal.fire({
        title: "Cảnh báo!",
        text: "Mã khuyến mãi không hợp lệ!",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const removePromoCode = (ticketId) => {
    setPromoCodes((prev) => ({
      ...prev,
      [ticketId]: { code: "", appliedDiscount: null },
    }));
  };

  // kiểm tra vé không còn bán
  const isTicketNotAvailable = (ticket) => {
    return new Date(ticket.saleEnd) < new Date();
  };

  //  tính giá sau giảm giá
  const calculateTicketPrice = (ticket) => {
    let price = ticket.price;
    const autoDiscount = ticket.discounts.find((d) => d.promoCode === null);
    const appliedDiscount = promoCodes[ticket.id].appliedDiscount;

    // Áp dụng discount có promoCode null
    if (autoDiscount) {
      price =
        autoDiscount.discountType === "PERCENT"
          ? price * (1 - autoDiscount.discountValue / 100)
          : price - autoDiscount.discountValue;
    }

    // Áp dụng discount từ mã nhập
    if (appliedDiscount && appliedDiscount.promoCode !== null) {
      if (appliedDiscount.discountType === "PERCENT") {
        price = price * (1 - appliedDiscount.discountValue / 100);
      } else if (appliedDiscount.discountType === "FIXED") {
        price = price - appliedDiscount.discountValue; 
      }
      // Để giá không âm
      price = Math.max(0, price);
    }

    return Math.max(0, price);
  };

  const calculateSummary = () => {
    let subtotal = 0;

    eventInfo.tickets.forEach((ticket) => {
      const quantity = quantities[ticket.id];
      if (quantity > 0) {
        const discountedPrice = calculateTicketPrice(ticket);
        subtotal += discountedPrice * quantity;
      }
    });

    return { subtotal, total: subtotal };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString("vi", { weekday: "long" });
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${weekday}, ${month}/${day}`;
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // THÊM MỚI: Hàm tạo JSON gửi backend
  const handleCheckout = async () => {
    const checkoutData = {
      scheduleId: selectedSchedule.scheduleId,
      tickets: Object.entries(quantities)
        .filter(([ticketId, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => {
          const ticket = eventInfo.tickets.find(
            (t) => t.id === parseInt(ticketId),
          );
          const autoDiscount = ticket.discounts.find(
            (d) => d.promoCode === null,
          );
          const appliedDiscount = promoCodes[ticketId].appliedDiscount;
          return {
            ticketId: parseInt(ticketId),
            quantity,
            discountId: appliedDiscount
              ? appliedDiscount.discountId
              : autoDiscount
                ? autoDiscount.discountId
                : null,
          };
        }),
    };

    // JSON với discountIds là mảng
    const checkoutDataWithArray = {
      scheduleId: selectedSchedule.scheduleId,
      tickets: Object.entries(quantities)
        .filter(([ticketId, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => {
          const ticket = eventInfo.tickets.find(
            (t) => t.id === parseInt(ticketId),
          );
          const autoDiscount = ticket.discounts.find(
            (d) => d.promoCode === null,
          );
          const appliedDiscount = promoCodes[ticketId].appliedDiscount;
          const discountIds = [];
          if (autoDiscount) discountIds.push(autoDiscount.discountId);
          if (appliedDiscount && appliedDiscount.promoCode !== null)
            discountIds.push(appliedDiscount.discountId);
          return {
            ticketId: parseInt(ticketId),
            quantity,
            discountIds,
          };
        }),
    };

    console.log("Checkout data with discountIds array:", checkoutDataWithArray);
    console.log("Checkout data for current backend:", checkoutData);

    try {
      setIsLoading(true);
      const data = await createOrder(checkoutDataWithArray, token);
      if (data) {
        window.open(data, "_blank");
      }
    } catch (error) {
      console.error("Create order", error);
    } finally {
      setIsLoading(false);
    }
    // closeModal();
  };

  const { subtotal = 0, total = 0 } = calculateSummary();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
      <div className="relative flex h-[90vh] w-[1100px] flex-col rounded-lg bg-white p-6 shadow-lg">
        {/* Tiêu đề và nút đóng */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chọn vé</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoCloseSharp
              size={20}
              className="cursor-pointer hover:text-red-500"
            />
          </button>
        </div>

        {/* Nội dung chính với chiều cao giới hạn */}
        <div className="flex h-[calc(90vh-120px)] flex-1 gap-6">
          {/* Cột trái: Thông tin sự kiện, danh sách vé, và nút Check out */}
          <div className="flex w-2/3 flex-col gap-4">
            <div>
              <h3 className="text-md font-medium">{eventInfo.name}</h3>
              <p className="mb-2 text-sm text-gray-600">
                {formatDate(selectedSchedule.scheduleDate).split(",")[0]}, ngày{" "}
                {
                  formatDate(selectedSchedule.scheduleDate)
                    .split(", ")[1]
                    .split("/")[1]
                }
                /
                {
                  formatDate(selectedSchedule.scheduleDate)
                    .split(", ")[1]
                    .split("/")[0]
                }
                /{new Date(selectedSchedule.scheduleDate).getFullYear()} từ{" "}
                {formatTime(selectedSchedule.startTime)} -{" "}
                {formatTime(selectedSchedule.endTime)}
              </p>
            </div>

            {/* Danh sách vé với scrollbar */}
            <div className="h-[370px] overflow-y-auto px-10">
              {eventInfo.tickets.map((ticket) => {
                const discountedPrice = calculateTicketPrice(ticket);
                const isNotAvailable = isTicketNotAvailable(ticket);
                return (
                  <div
                    key={ticket.id}
                    className="mb-4 rounded-lg border border-blue-500"
                  >
                    <div>
                      {/* Ô nhập mã khuyến mãi, chỉ hiển thị nếu vé còn bán */}
                      {!isNotAvailable ? (
                        ticket.discounts.some((d) => d.promoCode !== null) && (
                          <div className="mt-2 flex w-full items-center gap-2 px-3 pt-2">
                            <input
                              type="text"
                              placeholder="Nhập mã khuyến mãi"
                              value={promoCodes[ticket.id].code}
                              onChange={(e) =>
                                handlePromoCodeChange(ticket.id, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  applyPromoCode(ticket.id);
                                }
                              }}
                              className="flex-grow rounded border border-gray-300 px-2 py-1 text-sm"
                              disabled={!!promoCodes[ticket.id].appliedDiscount}
                            />
                            {promoCodes[ticket.id].appliedDiscount ? (
                              <button
                                onClick={() => removePromoCode(ticket.id)}
                                className="rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                              >
                                X
                              </button>
                            ) : (
                              <button
                                onClick={() => applyPromoCode(ticket.id)}
                                className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                              >
                                Áp dụng
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <div></div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <h4 className="text-lg font-medium">{ticket.name}</h4>
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">
                            {discountedPrice.toLocaleString()} VND
                          </span>
                          {discountedPrice < ticket.price && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {ticket.price.toLocaleString()} VND
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isNotAvailable
                            ? "Vé hiện không còn bán"
                            : `Mở bán đến ngày ${format(new Date(ticket.saleEnd), "dd/MM/yyyy")}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(ticket.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white"
                          disabled={
                            quantities[ticket.id] === 0 || isNotAvailable
                          }
                        >
                          -
                        </button>
                        <span className="text-md">{quantities[ticket.id]}</span>
                        <button
                          onClick={() => handleQuantityChange(ticket.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white"
                          disabled={isNotAvailable}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="-mb-2 -ml-6">
              <hr className="text-gray-300" />
            </div>

            {/* CẬP NHẬT: Nút Check out */}
            <div className="-mb-8">
              <button
                className="rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
                onClick={handleCheckout}
              >
                Thanh toán
              </button>
            </div>
          </div>

          {/* Cột phải: Hình ảnh và Order Summary */}
          <div className="flex w-1/3 flex-col gap-4">
            {/* Hình ảnh sự kiện */}
            <div className="h-48 w-full">
              <img
                src={eventInfo.imageUrl}
                alt={eventInfo.name}
                className="h-full w-full rounded-lg object-cover"
                loading="lazy"
              />
            </div>

            {/* Order Summary với scrollbar */}
            <div className="max-h-[calc(90vh-120px-128px)] flex-1 overflow-y-auto">
              <h3 className="text-md mb-3 font-medium">Tóm tắt đơn hàng</h3>
              {eventInfo.tickets.map((ticket) => {
                const quantity = quantities[ticket.id];
                if (quantity === 0) return null;
                const discountedPrice = calculateTicketPrice(ticket);
                return (
                  <div
                    key={ticket.id}
                    className="mb-2 flex justify-between text-sm"
                  >
                    <span>
                      {ticket.name} x {quantity}
                    </span>
                    <span>
                      {(discountedPrice * quantity).toLocaleString()} VND
                    </span>
                  </div>
                );
              })}
              <hr className="my-3 border-gray-300" />
              <div className="text-md flex justify-between font-medium">
                <span>Tổng tiền</span>
                <span>{total.toLocaleString()} VND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Loading isLoading={isLoading} />
    </div>,
    document.body,
  );
};

export default TicketSelectionModal;
