import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { IoCloseSharp } from "react-icons/io5";
import { createOrder, reserveOrder } from "services/user/orderService";
import Loading from "@/components/ui/Loading";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const TicketSelectionModal = ({
  eventInfo,
  selectedSchedule,
  closeModal,
  calculateDiscountedPrice,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
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
      const ticket = eventInfo.tickets.find((t) => t.id === ticketId);
      const remaining =
        ticket.availableQuantity - ticket.sold - ticket.reservedQuantity;
      const newQuantity = prev[ticketId] + delta;

      if (newQuantity < 0) {
        return prev; // Không cho âm
      }

      if (newQuantity > remaining) {
        Swal.fire({
          title: "Xin lỗi!",
          text: `Hiện chỉ còn ${remaining} vé! Vui lòng quay lại sau.`,
          icon: "warning",
          confirmButtonText: "OK",
        });
        return prev;
      }

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
    const now = new Date();
    const discount = ticket.discounts.find(
      (d) =>
        d.promoCode === promoCode &&
        new Date(d.discountStart) <= now &&
        new Date(d.discountEnd) >= now && // Kiểm tra discountEnd
        (d.maxUses === null || d.timesUsed < d.maxUses), // Kiểm tra maxUses
    );

    if (discount && discount.promoCode !== null) {
      setPromoCodes((prev) => ({
        ...prev,
        [ticketId]: { code: discount.promoCode, appliedDiscount: discount },
      }));
    } else {
      Swal.fire({
        title: "Cảnh báo!",
        text: "Mã khuyến mãi không hợp lệ hoặc đã hết hiệu lực!",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  // const applyPromoCode = (ticketId) => {
  //   const ticket = eventInfo.tickets.find((t) => t.id === ticketId);
  //   const promoCode = promoCodes[ticketId].code;
  //   const discount = ticket.discounts.find((d) => d.promoCode === promoCode);

  //   if (discount && discount.promoCode !== null) {
  //     setPromoCodes((prev) => ({
  //       ...prev,
  //       [ticketId]: { code: discount.promoCode, appliedDiscount: discount },
  //     }));
  //   } else {
  //     Swal.fire({
  //       title: "Cảnh báo!",
  //       text: "Mã khuyến mãi không hợp lệ!",
  //       icon: "warning",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // };

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
    const now = new Date();

    // Áp dụng discount có promoCode null
    const autoDiscount = ticket.discounts.find(
      (d) =>
        d.promoCode === null &&
        new Date(d.discountStart) <= now &&
        new Date(d.discountEnd) >= now && // Kiểm tra discountEnd
        (d.maxUses === null || d.timesUsed < d.maxUses), // Kiểm tra maxUses
    );

    // Áp dụng discount từ mã nhập
    const appliedDiscount = promoCodes[ticket.id].appliedDiscount;
    const validAppliedDiscount =
      appliedDiscount &&
      new Date(appliedDiscount.discountStart) <= now &&
      new Date(appliedDiscount.discountEnd) >= now && // Kiểm tra discountEnd
      (appliedDiscount.maxUses === null ||
        appliedDiscount.timesUsed < appliedDiscount.maxUses) // Kiểm tra maxUses
        ? appliedDiscount
        : null;

    // Áp dụng autoDiscount
    if (autoDiscount) {
      price =
        autoDiscount.discountType === "PERCENT"
          ? price * (1 - autoDiscount.discountValue / 100)
          : price - autoDiscount.discountValue;
    }

    // Áp dụng validAppliedDiscount
    if (validAppliedDiscount && validAppliedDiscount.promoCode !== null) {
      price =
        validAppliedDiscount.discountType === "PERCENT"
          ? price * (1 - validAppliedDiscount.discountValue / 100)
          : price - validAppliedDiscount.discountValue;
    }

    return Math.max(0, price);
  };

  // const calculateTicketPrice = (ticket) => {
  //   let price = ticket.price;
  //   const autoDiscount = ticket.discounts.find((d) => d.promoCode === null);
  //   const appliedDiscount = promoCodes[ticket.id].appliedDiscount;

  //   // Áp dụng discount có promoCode null
  //   if (autoDiscount) {
  //     price =
  //       autoDiscount.discountType === "PERCENT"
  //         ? price * (1 - autoDiscount.discountValue / 100)
  //         : price - autoDiscount.discountValue;
  //   }

  //   // Áp dụng discount từ mã nhập
  //   if (appliedDiscount && appliedDiscount.promoCode !== null) {
  //     if (appliedDiscount.discountType === "PERCENT") {
  //       price = price * (1 - appliedDiscount.discountValue / 100);
  //     } else if (appliedDiscount.discountType === "FIXED") {
  //       price = price - appliedDiscount.discountValue;
  //     }
  //     // Để giá không âm
  //     price = Math.max(0, price);
  //   }

  //   return Math.max(0, price);
  // };

  // const calculateSummary = () => {
  //   let subtotal = 0;

  //   eventInfo.tickets.forEach((ticket) => {
  //     const quantity = quantities[ticket.id];
  //     if (quantity > 0) {
  //       const discountedPrice = calculateTicketPrice(ticket);
  //       subtotal += discountedPrice * quantity;
  //     }
  //   });

  //   return { subtotal, total: subtotal };
  // };
  const calculateSummary = () => {
    let subtotal = 0;
    const ticketDetails = [];

    eventInfo.tickets.forEach((ticket) => {
      const quantity = quantities[ticket.id];
      if (quantity > 0) {
        const now = new Date();
        let remainingUses = 0;

        // Tìm autoDiscount
        const autoDiscount = ticket.discounts.find(
          (d) =>
            d.promoCode === null &&
            new Date(d.discountStart) <= now &&
            new Date(d.discountEnd) >= now &&
            (d.maxUses === null || d.timesUsed < d.maxUses),
        );
        if (autoDiscount && autoDiscount.maxUses !== null) {
          remainingUses = autoDiscount.maxUses - autoDiscount.timesUsed;
        }

        // Tìm validAppliedDiscount
        const appliedDiscount = promoCodes[ticket.id].appliedDiscount;
        const validAppliedDiscount =
          appliedDiscount &&
          new Date(appliedDiscount.discountStart) <= now &&
          new Date(appliedDiscount.discountEnd) >= now &&
          (appliedDiscount.maxUses === null ||
            appliedDiscount.timesUsed < appliedDiscount.maxUses)
            ? appliedDiscount
            : null;
        if (validAppliedDiscount && validAppliedDiscount.maxUses !== null) {
          remainingUses = Math.max(
            remainingUses,
            validAppliedDiscount.maxUses - validAppliedDiscount.timesUsed,
          );
        }

        // Tính số vé áp discount và không áp
        const discountedQuantity =
          remainingUses > 0 ? Math.min(quantity, remainingUses) : quantity;
        const nonDiscountedQuantity = quantity - discountedQuantity;

        // Tính giá vé
        let discountedPrice = ticket.price;
        if (discountedQuantity > 0) {
          if (autoDiscount) {
            discountedPrice =
              autoDiscount.discountType === "PERCENT"
                ? discountedPrice * (1 - autoDiscount.discountValue / 100)
                : discountedPrice - autoDiscount.discountValue;
          }
          if (validAppliedDiscount && validAppliedDiscount.promoCode !== null) {
            discountedPrice =
              validAppliedDiscount.discountType === "PERCENT"
                ? discountedPrice *
                  (1 - validAppliedDiscount.discountValue / 100)
                : discountedPrice - validAppliedDiscount.discountValue;
          }
        }
        const originalPrice = ticket.price;

        subtotal +=
          discountedPrice * discountedQuantity +
          originalPrice * nonDiscountedQuantity;

        // ticketDetails dùng để hiển thị trong UI
        ticketDetails.push({
          id: ticket.id,
          name: ticket.name,
          discountedQuantity,
          nonDiscountedQuantity,
          discountedPrice,
          originalPrice,
        });
      }
    });

    return { subtotal, total: subtotal, ticketDetails };
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

  const handleContinue = async (slug) => {
    const hasSelectedTickets = Object.values(quantities).some((qty) => qty > 0);
    if (!hasSelectedTickets) {
      Swal.fire({
        title: "Cảnh báo!",
        text: "Vui lòng chọn ít nhất một vé trước khi tiếp tục!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    if (!eventInfo.slug) {
      Swal.fire({
        title: "Lỗi!",
        text: "Không tìm thấy thông tin sự kiện!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const checkoutDataWithArray = {
      scheduleId: selectedSchedule.scheduleId,
      tickets: Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .flatMap(([ticketId, quantity]) => {
          const ticket = eventInfo.tickets.find(
            (t) => t.id === parseInt(ticketId),
          );
          const now = new Date();

          // Tìm autoDiscount
          const autoDiscount = ticket.discounts.find(
            (d) =>
              d.promoCode === null &&
              new Date(d.discountStart) <= now &&
              new Date(d.discountEnd) >= now &&
              (d.maxUses === null || d.timesUsed < d.maxUses),
          );

          // Tìm validAppliedDiscount
          const appliedDiscount = promoCodes[ticketId].appliedDiscount;
          const validAppliedDiscount =
            appliedDiscount &&
            new Date(appliedDiscount.discountStart) <= now &&
            new Date(appliedDiscount.discountEnd) >= now &&
            (appliedDiscount.maxUses === null ||
              appliedDiscount.timesUsed < appliedDiscount.maxUses)
              ? appliedDiscount
              : null;

          // Tính số lượng vé áp discount
          let remainingUses = 0;
          if (autoDiscount && autoDiscount.maxUses !== null) {
            remainingUses = autoDiscount.maxUses - autoDiscount.timesUsed;
          }
          if (validAppliedDiscount && validAppliedDiscount.maxUses !== null) {
            remainingUses = Math.max(
              remainingUses,
              validAppliedDiscount.maxUses - validAppliedDiscount.timesUsed,
            );
          }

          const discountedQuantity =
            remainingUses > 0 ? Math.min(quantity, remainingUses) : quantity;
          const nonDiscountedQuantity = quantity - discountedQuantity;

          const discountIds = [];
          if (autoDiscount && discountedQuantity > 0)
            discountIds.push(autoDiscount.discountId);
          if (
            validAppliedDiscount &&
            validAppliedDiscount.promoCode !== null &&
            discountedQuantity > 0
          )
            discountIds.push(validAppliedDiscount.discountId);

          // Tạo 2 ticketItem
          const result = [];
          if (discountedQuantity > 0) {
            result.push({
              ticketId: parseInt(ticketId),
              quantity: discountedQuantity,
              discountIds,
            });
          }
          if (nonDiscountedQuantity > 0) {
            result.push({
              ticketId: parseInt(ticketId),
              quantity: nonDiscountedQuantity,
              discountIds: [],
            });
          }
          return result;
        }),
    };

    console.log("checkoutDataWithArray ", checkoutDataWithArray);

    try {
      const response = await reserveOrder(checkoutDataWithArray, token);
      console.log("Reserve order response:", response);
      if (
        response &&
        response.data &&
        response.data.orderId &&
        response.data.reservationTime
      ) {
        const { orderId } = response.data;
        navigate(`/user/${slug}/payment/${orderId}`);
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: "Dữ liệu trả về không hợp lệ. Vui lòng thử lại!",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error reserving order:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Có lỗi khi đặt vé. Vui lòng thử lại!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const { subtotal = 0, total = 0, ticketDetails = [] } = calculateSummary();

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
                const now = new Date();
                const hasValidPromoDiscount = ticket.discounts.some(
                  (d) =>
                    d.promoCode !== null &&
                    new Date(d.discountStart) <= now &&
                    new Date(d.discountEnd) >= now &&
                    (d.maxUses === null || d.timesUsed < d.maxUses),
                );

                return (
                  <div
                    key={ticket.id}
                    className="mb-4 rounded-lg border border-blue-500"
                  >
                    <div>
                      {/* Ô nhập mã khuyến mãi, chỉ hiển thị nếu vé còn bán và có discount hợp lệ */}
                      {!isNotAvailable && hasValidPromoDiscount && (
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
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                            isNotAvailable || quantities[ticket.id] === 0
                              ? "cursor-not-allowed bg-gray-300"
                              : "bg-orange-400"
                          }`}
                          disabled={
                            quantities[ticket.id] === 0 || isNotAvailable
                          }
                        >
                          -
                        </button>
                        <span className="text-md">{quantities[ticket.id]}</span>
                        <button
                          onClick={() => handleQuantityChange(ticket.id, 1)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                            isNotAvailable
                              ? "bg-gray-300 disabled:bg-gray-300"
                              : "bg-orange-500 hover:bg-orange-600"
                          }`}
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

            {/* Nút Check out */}
            <div className="-mb-4">
              {/* <button
                className="rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
                onClick={handleCheckout}
              > 
                Thanh toán
              </button> */}
              <button
                className="cursor-pointer rounded-lg bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
                onClick={() => handleContinue(eventInfo.slug)}
              >
                Tiếp tục
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
            <div className="max-h-full flex-1 overflow-y-auto">
              <h3 className="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h3>
              {ticketDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="mb-2 flex flex-col text-sm text-gray-700"
                >
                  {detail.discountedQuantity > 0 && (
                    <div className="flex justify-between">
                      <span>
                        {detail.name} x {detail.discountedQuantity} (Giảm giá)
                      </span>
                      <span>
                        {(
                          detail.discountedQuantity * detail.discountedPrice
                        ).toLocaleString()}{" "}
                        VND
                      </span>
                    </div>
                  )}
                  {detail.nonDiscountedQuantity > 0 && (
                    <div className="flex justify-between">
                      <span>
                        {detail.name} x {detail.nonDiscountedQuantity}
                      </span>
                      <span>
                        {(
                          detail.nonDiscountedQuantity * detail.originalPrice
                        ).toLocaleString()}{" "}
                        VND
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <hr className="my-4 border-gray-400" />
              <div className="text-md flex justify-between font-semibold">
                <span>Tổng</span>
                <span>{total.toLocaleString()} VNĐ</span>
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
