import TicketModal from "components/modal/TicketModal";
import Loading from "components/UI/Loading";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { IoTicketOutline } from "react-icons/io5";
import { createDiscount, updateDiscount } from "services/user/discountService";
import { getEventInfoById } from "services/user/eventService";
import Swal from "sweetalert2";
// import {
//   createPromotion,
//   updatePromotion,
// } from "services/user/promotionService";
import { formatDateTime } from "utils/formatSchedule";
import { useEventRoute } from "utils/useEventRoute";

const CreatePromotion = () => {
  const { eventId, section } = useEventRoute();
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    getValues,
    setValue,
    control,
    watch,
  } = useForm({ mode: "onBlur" });
  const discountType = watch("discountType", "PERCENT");

  const [selectedOption, setSelectedOption] = useState("all");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketIds, setTicketIds] = useState([]);

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    const currentPromotion = promotions.find(
      (p) => p.discountId === getValues("discountId"),
    );

    if (value === "all") {
      const allTicketIds = currentPromotion
        ? (currentPromotion.tickets || []).map((ticket) => ticket.id)
        : (allTickets || []).map((ticket) => ticket.id);
      setTicketIds(allTicketIds);
      console.log("Reset ticketIds khi chọn all:", allTicketIds);
    } else if (value === "certain") {
      // Nếu chỉnh sửa, giữ ticketIds cũ; nếu tạo mới, reset về []
      const initialTicketIds = currentPromotion
        ? currentPromotion.ticketIds || []
        : [];
      setTicketIds(initialTicketIds);
      console.log("Reset ticketIds khi chọn certain:", initialTicketIds);
    }
  };

  const onSubmit = async (data) => {
    const currentPromotion = promotions.find(
      (promotion) => promotion.discountId === data.discountId,
    );
    // Nếu chọn "Chỉ một vài vé" mà ticketIds rỗng
    if (selectedOption === "certain" && ticketIds.length === 0) {
      alert("Vui lòng chọn ít nhất một vé khi áp dụng cho một vài vé");
      return;
    }
    const allTicketIds =
      selectedOption === "all"
        ? currentPromotion
          ? (currentPromotion.tickets || []).map((ticket) => ticket.id)
          : (allTickets || []).map((ticket) => ticket.id)
        : ticketIds;

    const requestData = {
      ...data,
      ticketIds: allTicketIds,
    };

    console.log("Dữ liệu gửi đi:", requestData);

    try {
      setIsLoading(true);
      if (requestData.discountId) {
        const data = await updateDiscount(requestData.discountId, requestData, token);
        if (data.message === "Update promotion was successfully!") {
          Swal.fire({
            title: "Cập nhật khuyến mãi thành công!",
            text: `Khuyến mãi của bạn đã được cập nhật!.`,
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Cập nhật khuyến mãi không thành công!.`,
            icon: "error",
          });
        }
      } else {
        const data = await createDiscount(requestData, token);
        if (data.message === "Create promotion was successfully!") {
          Swal.fire({
            title: "Thêm khuyến mãi thành công!",
            text: `Khuyến mãi của bạn đã được thêm!.`,
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Thêm khuyến mãi không thành công!.`,
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Create/Update promotion error", error);
      Swal.fire({
        title: "Lỗi!",
        text: `Thêm khuyến mãi không thành công!.`,
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [allTickets, setAllTickets] = useState([]); // tickets cho lần đầu tạo khuyến mãi
  const [eventType, setEventType] = useState("RECURRING");
  const [promotionType, setPromotionType] = useState("promotion");
  const [maxUsesOption, setMaxUsesOption] = useState("unlimited");

  const handlePromotionSelect = (promotion) => {
    setValue("discountId", promotion.discountId);
    setValue("name", promotion.name);
    setValue("promoCode", promotion.promoCode);
    setValue("discountType", promotion.discountType);
    setValue("discountValue", promotion.discountValue);
    setValue("maxUses", promotion.maxUses);

    const formatDateTime = (dateTime) => {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    setValue("discountStart", formatDateTime(promotion.discountStart));
    setValue("discountEnd", formatDateTime(promotion.discountEnd));
    // ... (các setValue khác)
    setTicketIds(promotion.ticketIds || []); // Đảm bảo ticketIds đúng
    setSelectedOption(
      promotion.ticketIds?.length === 0 ||
        (promotion.ticketIds?.length === promotion.tickets.length &&
          promotion.ticketIds?.every((id) =>
            promotion.tickets.some((ticket) => ticket.id === id),
          ) &&
          promotion.tickets.every((ticket) =>
            promotion.ticketIds?.includes(ticket.id),
          ))
        ? "all"
        : "certain",
    );

    setMaxUsesOption(promotion.maxUses == null ? "unlimited" : "limited");
    setPromotionType(promotion.promoCode ? "coupon" : "promotion");
  };

  useEffect(() => {
    setIsLoading(true);
    getEventInfoById(eventId)
      .then((data) => {
        if (!data.schedules || data.schedules.length === 0) {
          setIsReady(false);
          setIsLoading(false);
          return;
        }

        // Lấy tất cả tickets từ dữ liệu giả lập
        const allTickets = [
          ...new Map(
            data.schedules
              .flatMap((schedule) => schedule.ticketSchedules)
              .map((ticket) => [
                ticket.id,
                { id: ticket.id, name: ticket.name, price: ticket.price },
              ]),
          ).values(),
        ];
        setAllTickets(allTickets);

        // Gộp promotions và gán ticketIds
        const mergedPromotions = data.schedules
          .flatMap((schedule) => schedule.ticketSchedules)
          .flatMap((ticket) =>
            ticket.discounts.map((discount) => ({ discount, ticket })),
          )
          .reduce((acc, { discount, ticket }) => {
            const existingPromotion = acc.find(
              (p) => p.discountId === discount.discountId,
            );

            if (existingPromotion) {
              // Chỉ thêm ticket.id vào ticketIds nếu chưa tồn tại
              if (!existingPromotion.ticketIds.includes(ticket.id)) {
                existingPromotion.ticketIds.push(ticket.id);
              }
            } else {
              acc.push({
                discountId: discount.discountId,
                name: discount.name,
                promoCode: discount.promoCode,
                discountType: discount.discountType,
                discountValue: discount.discountValue,
                maxUses: discount.maxUses,
                timesUsed: discount.timesUsed,
                discountStart: discount.discountStart,
                discountEnd: discount.discountEnd,
                tickets: [...allTickets], // Gán tất cả vé vào tickets
                ticketIds: [ticket.id], // Chỉ gán ticketIds được liên kết
              });
            }
            return acc;
          }, []);

        console.log("merge promotions", mergedPromotions);
        setPromotions(mergedPromotions);
        setEventType(data.eventType);
        setIsReady(true);
      })
      .catch((err) => {
        console.log("getEventInfoById", err);
        setIsReady(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [eventId, setValue, setEventType]);

  // useEffect(() => {
  //   setIsLoading(true);

  //   // Giả lập dữ liệu trả về từ API
  //   const fakeScheduleData = {
  //     eventType: "RECURRING",
  //     schedules: [
  //       {
  //         scheduleId: 24,
  //         scheduleDate: "2024-04-21",
  //         startTime: "10:00:00",
  //         endTime: "11:00:00",
  //         ticketSchedules: [
  //           {
  //             id: 6,
  //             name: "VIP Ticket",
  //             description: "Access to all areas",
  //             sold: 0,
  //             price: 100.0,
  //             availableQuantity: 50,
  //             saleStart: "2025-04-01T10:00:00",
  //             saleEnd: "2025-04-05T22:00:00",
  //             discounts: [
  //               {
  //                 discountId: "3",
  //                 name: "Early Bird Discount",
  //                 promoCode: null,
  //                 discountType: "PERCENT",
  //                 discountValue: 15.0,
  //                 maxUses: null,
  //                 timesUsed: 0,
  //                 discountStart: "2025-04-20T00:00:00",
  //                 discountEnd: "2025-04-21T23:59:59",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //       {
  //         scheduleId: 25,
  //         scheduleDate: "2024-04-22",
  //         startTime: "10:00:00",
  //         endTime: "11:00:00",
  //         ticketSchedules: [
  //           {
  //             id: 6,
  //             name: "VIP Ticket",
  //             description: "Access to all areas",
  //             sold: 0,
  //             price: 100.0,
  //             availableQuantity: 50,
  //             saleStart: "2025-04-01T10:00:00",
  //             saleEnd: "2025-04-05T22:00:00",
  //             discounts: [
  //               {
  //                 discountId: "3",
  //                 name: "Early Bird Discount",
  //                 promoCode: null,
  //                 discountType: "PERCENT",
  //                 discountValue: 15.0,
  //                 maxUses: null,
  //                 timesUsed: 0,
  //                 discountStart: "2025-04-20T00:00:00",
  //                 discountEnd: "2025-04-21T23:59:59",
  //               },
  //               {
  //                 discountId: "4",
  //                 name: "Early Bird Discount",
  //                 promoCode: "abc",
  //                 discountType: "FIXED",
  //                 discountValue: 15.0,
  //                 maxUses: 10,
  //                 timesUsed: 1,
  //                 discountStart: "2025-04-20T00:00:00",
  //                 discountEnd: "2025-04-21T23:59:59",
  //               },
  //             ],
  //           },
  //           {
  //             id: 7,
  //             name: "zkai1",
  //             description: "",
  //             sold: 0,
  //             price: 10000.0,
  //             availableQuantity: 100,
  //             saleStart: "2025-04-20T12:29:00",
  //             saleEnd: "2025-04-22T10:00:00",
  //             discounts: [
  //               {
  //                 discountId: "3",
  //                 name: "Early Bird Discount",
  //                 promoCode: null,
  //                 discountType: "PERCENT",
  //                 discountValue: 15.0,
  //                 maxUses: null,
  //                 timesUsed: 0,
  //                 discountStart: "2025-04-20T00:00:00",
  //                 discountEnd: "2025-04-21T23:59:59",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //   };

  //   if (
  //     !fakeScheduleData.schedules ||
  //     fakeScheduleData.schedules.length === 0
  //   ) {
  //     setIsReady(false);
  //     setIsLoading(false);
  //     return;
  //   }

  //   // Lấy tất cả tickets từ dữ liệu giả lập
  //   const allTickets = [
  //     ...new Map(
  //       fakeScheduleData.schedules
  //         .flatMap((schedule) => schedule.ticketSchedules)
  //         .map((ticket) => [
  //           ticket.id,
  //           { id: ticket.id, name: ticket.name, price: ticket.price },
  //         ]),
  //     ).values(),
  //   ];

  //   // Gộp promotions và gán ticketIds
  //   const mergedPromotions = fakeScheduleData.schedules
  //     .flatMap((schedule) => schedule.ticketSchedules)
  //     .flatMap((ticket) =>
  //       ticket.discounts.map((discount) => ({ discount, ticket })),
  //     )
  //     .reduce((acc, { discount, ticket }) => {
  //       const existingPromotion = acc.find(
  //         (p) => p.discountId === discount.discountId,
  //       );

  //       if (existingPromotion) {
  //         // Chỉ thêm ticket.id vào ticketIds nếu chưa tồn tại
  //         if (!existingPromotion.ticketIds.includes(ticket.id)) {
  //           existingPromotion.ticketIds.push(ticket.id);
  //         }
  //       } else {
  //         acc.push({
  //           discountId: discount.discountId,
  //           name: discount.name,
  //           promoCode: discount.promoCode,
  //           discountType: discount.discountType,
  //           discountValue: discount.discountValue,
  //           maxUses: discount.maxUses,
  //           timesUsed: discount.timesUsed,
  //           discountStart: discount.discountStart,
  //           discountEnd: discount.discountEnd,
  //           tickets: [...allTickets], // Gán tất cả vé vào tickets
  //           ticketIds: [ticket.id], // Chỉ gán ticketIds được liên kết
  //         });
  //       }
  //       return acc;
  //     }, []);

  //   console.log("merge promotions", mergedPromotions);
  //   setPromotions(mergedPromotions);
  //   setEventType(fakeScheduleData.eventType);
  //   setIsReady(true);
  //   setIsLoading(false);
  // }, [eventId, setValue, setEventType, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        clearErrors();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, clearErrors]);

  return (
    <div className="px-2">
      <div className="text-right">
        <button
          onClick={() => {
            setValue("discountId", null);
            setValue("name", "");
            setValue("promoCode", null); // Reset promoCode
            setValue("discountType", "PERCENT");
            setValue("discountValue", "");
            setValue("maxUses", null);
            setValue("discountStart", "");
            setValue("discountEnd", "");
            setTicketIds([]);
            setSelectedOption("all");
            setPromotionType("promotion");
            setMaxUsesOption("unlimited");
            setIsOpen(true);
          }}
          className={`bg-main hover:bg-main-bold cursor-pointer rounded-lg px-4 py-2 text-xl font-medium text-white transition-colors`}
        >
          Tạo khuyến mãi mới
        </button>
      </div>

      {/* List promotion */}
      <div className="mt-6 flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="inline-block min-w-full p-1.5 align-middle">
            <div className="overflow-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary">
                  <tr>
                    <th
                      scope="col"
                      className="w-[16.6%] px-4 py-3 text-start text-sm font-medium text-white"
                    >
                      Tên mã
                    </th>
                    <th
                      scope="col"
                      className="w-[16.6%] px-4 py-3 text-start text-sm font-medium text-white"
                    >
                      Hình thức ưu đãi
                    </th>
                    <th
                      scope="col"
                      className="w-[16.6%] px-4 py-3 text-start text-sm font-medium text-white"
                    >
                      Giá trị
                    </th>
                    <th
                      scope="col"
                      className="w-[16.6%] px-4 py-3 text-start text-sm font-medium text-white"
                    >
                      Đã sử dụng/Tổng
                    </th>
                    <th
                      scope="col"
                      className="w-[16.6%] px-4 py-3 text-start text-sm font-medium text-white"
                    >
                      Áp dụng cho
                    </th>
                    <th
                      scope="col"
                      className="w-[16.6%] px-4 py-3 text-end text-sm font-medium text-white"
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {promotions.length > 0 &&
                    promotions.map((promotion) => {
                      return (
                        <tr key={promotion.discountId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {promotion.promoCode
                                    ? promotion.promoCode
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800">
                            <div
                              className={`${promotion.promoCode ? "bg-secondary-light" : "bg-main-semilight"} inline-block rounded-xl px-2 py-1 font-semibold`}
                            >
                              {promotion.promoCode ? "Voucher" : "Discount"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800">
                            {promotion.discountType === "PERCENT"
                              ? `${promotion.discountValue}%`
                              : `${promotion.discountValue}VND`}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800">
                            {promotion.maxUses
                              ? `${promotion.timesUsed}/${promotion.maxUses}`
                              : "Không giới hạn"}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800">
                            <div className="flex items-center space-x-2">
                              <IoTicketOutline />
                              <span>{promotion.ticketIds.length} vé</span>
                            </div>
                          </td>
                          <td className="text-end text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                handlePromotionSelect(promotion);
                                setIsOpen(true);
                              }}
                              className="cursor-pointer text-black hover:text-blue-600"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* create promotion form */}
      <div
        // ref={panelRef}
        className={`fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-110 bg-white transition-transform duration-300 ease-in-out ${
          isOpen && section === "promotions"
            ? "translate-x-0 shadow-xl"
            : "translate-x-full"
        } flex flex-col`}
      >
        <div className="bg-main flex items-center justify-between border-b border-gray-200 px-6 py-3">
          <h2 className="text-xl font-semibold text-white">
            Tạo khuyến mãi mới
          </h2>
          <button
            onClick={() => {
              setIsOpen(false);
              clearErrors();
            }}
            className="hover:text-emphasis text-white transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col space-y-3">
            <div>
              {/* <label className="mb-1 block text-sm font-medium text-gray-600">
                Loại
              </label> */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setPromotionType("promotion");
                    setValue("promoCode", null);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    promotionType === "promotion"
                      ? "bg-main text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Khuyến mãi
                </button>
                <button
                  type="button"
                  onClick={() => setPromotionType("coupon")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    promotionType === "coupon"
                      ? "bg-main text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Voucher
                </button>
              </div>

              {/* promoCode input */}
            </div>
            {promotionType === "coupon" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Mã giảm giá
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  {...register("promoCode", {
                    required:
                      promotionType === "coupon"
                        ? "Mã khuyến mãi là bắt buộc"
                        : false,
                  })}
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                    errors.promoCode
                      ? "border-2 border-red-500"
                      : "focus:ring-main focus:border-none focus:ring-2"
                  } `}
                />
                {errors.promoCode && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.promoCode.message === "string"
                      ? errors.promoCode.message
                      : "Error!"}
                  </p>
                )}
              </div>
            )}

            {/* name input */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Tên khuyến mãi
              </label>
              <input
                type="text"
                placeholder="Nhập tên khuyến mãi"
                {...register("name", {
                  required: "Tên khuyến mãi là bắt buộc",
                })}
                className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                  errors.name
                    ? "border-2 border-red-500"
                    : "focus:ring-main focus:border-none focus:ring-2"
                } `}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {typeof errors.name.message === "string"
                    ? errors.name.message
                    : "Error!"}
                </p>
              )}
            </div>

            {/* discountType and discountValue input */}
            <div className="flex space-x-3">
              <div className="w-1/2">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Loại khuyến mãi
                </label>
                <select
                  {...register("discountType", {
                    required: "Loại khuyến mãi là bắt buộc",
                  })}
                  defaultValue="PERCENT"
                  className={`w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                    errors.discountType
                      ? "border-2 border-red-500"
                      : "focus:ring-main focus:border-none focus:ring-2"
                  } `}
                >
                  <option value="PERCENT">Phần trăm (%)</option>
                  <option value="FIXED">Số tiền (VND)</option>
                </select>
                {errors.discountType && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.discountType.message === "string"
                      ? errors.discountType.message
                      : "Error!"}
                  </p>
                )}
              </div>

              <div className="w-1/2">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Giá trị khuyến mãi
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("discountValue", {
                      required: "Giá trị khuyến mãi là bắt buộc",
                      min: {
                        value: 0,
                        message: "Giá trị phải lớn hơn hoặc bằng 0",
                      },
                    })}
                    className={`w-full appearance-none rounded-lg border border-gray-500 px-4 py-2 pr-10 outline-none ${
                      errors.discountValue
                        ? "border-2 border-red-500"
                        : "focus:ring-main focus:border-none focus:ring-2"
                    } `}
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                    {discountType === "PERCENT" ? "%" : "VND"}
                  </span>
                </div>
                {errors.discountValue && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.discountValue.message === "string"
                      ? errors.discountValue.message
                      : "Error!"}
                  </p>
                )}
              </div>
            </div>

            {/* maxUses input */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Số lần sử dụng
              </label>
              <div className="mb-2 flex items-center">
                <input
                  type="radio"
                  name="maxUsesOption"
                  className="mr-2"
                  value="limited"
                  checked={maxUsesOption === "limited"}
                  onChange={(e) => {
                    setMaxUsesOption(e.target.value);
                    if (e.target.value !== "limited") {
                      setValue("maxUses", null);
                    } else {
                      setValue("maxUses", getValues("maxUses") || 1); // Đặt giá trị mặc định nếu cần
                    }
                  }}
                />
                <span>Giới hạn</span>
              </div>
              <div className="mb-2 flex items-center">
                <input
                  type="radio"
                  name="maxUsesOption"
                  className="mr-2"
                  value="unlimited"
                  checked={maxUsesOption === "unlimited"}
                  onChange={(e) => {
                    setMaxUsesOption(e.target.value);
                    setValue("maxUses", null);
                  }}
                />
                <span>Không giới hạn</span>
              </div>
              {maxUsesOption === "limited" && (
                <div>
                  <input
                    type="number"
                    placeholder="Nhập số lần sử dụng tối đa"
                    {...register("maxUses", {
                      required:
                        maxUsesOption === "limited"
                          ? "Số lần sử dụng là bắt buộc"
                          : false,
                      min: {
                        value: 1,
                        message: "Số lần sử dụng phải lớn hơn 0",
                      },
                    })}
                    className={`w-full appearance-none rounded-lg border border-gray-500 px-4 py-2 outline-none ${
                      errors.maxUses
                        ? "border-2 border-red-500"
                        : "focus:ring-main focus:border-none focus:ring-2"
                    } `}
                  />
                  {errors.maxUses && (
                    <p className="mt-1 text-sm text-red-500">
                      {typeof errors.maxUses.message === "string"
                        ? errors.maxUses.message
                        : "Error!"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* apply promotion to tickets radio */}
            <div className="mt-1">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Áp dụng khuyến mãi cho
              </p>

              <div className="mb-2 flex items-center">
                <input
                  type="radio"
                  name="applyTo"
                  className="mr-2"
                  value="all"
                  checked={selectedOption === "all"}
                  onChange={handleOptionChange}
                />
                <span>Tất cả vé</span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="applyTo"
                    className="mr-2"
                    value="certain"
                    checked={selectedOption === "certain"}
                    onChange={handleOptionChange}
                  />
                  <span>Chỉ một vài vé</span>
                </div>

                {selectedOption === "certain" && (
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setShowTicketModal(true)}
                  >
                    Chọn vé
                  </button>
                )}
              </div>

              {selectedOption === "certain" && ticketIds.length > 0 && (
                <div className="mt-2">
                  {ticketIds.map((ticketId) => {
                    const ticket = getValues("discountId")
                      ? promotions
                          .find((p) => p.discountId === getValues("discountId"))
                          ?.tickets.find((t) => t.id === ticketId)
                      : allTickets.find((t) => t.id === ticketId);
                    if (!ticket) return null;
                    return (
                      <div
                        key={ticketId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="mt-2 ml-5 flex flex-col">
                            <span className="text-md">{`${ticket.name}`}</span>
                            <span className="text-sm text-gray-500">{`${ticket.price} VND`}</span>
                          </div>

                          <button
                            onClick={() =>
                              setTicketIds(
                                ticketIds.filter((id) => id !== ticketId),
                              )
                            }
                            className="group bg-emphasis relative flex h-[32px] w-[32px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-none font-semibold shadow-[0_0_10px_rgba(0,0,0,0.12)] transition-all duration-300 hover:w-[80px] hover:rounded-full hover:bg-red-500"
                          >
                            <span className="absolute top-[-14px] text-[1px] text-white opacity-0 transition-all duration-300 group-hover:translate-y-[18px] group-hover:text-[10px] group-hover:opacity-100">
                              Xoá
                            </span>
                            <svg
                              viewBox="0 0 448 512"
                              className="w-[10px] transition-all duration-300 group-hover:w-[28px] group-hover:translate-y-[50%]"
                            >
                              <path
                                fill="white"
                                d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {showTicketModal && (
                <TicketModal
                  closeModal={() => setShowTicketModal(false)}
                  onTicketsSelected={(selectedIds) => {
                    console.log("Đã chọn vé:", selectedIds);
                    setTicketIds(selectedIds);
                    setShowTicketModal(false);
                  }}
                  tickets={
                    getValues("discountId")
                      ? promotions.find(
                          (p) => p.discountId === getValues("discountId"),
                        )?.tickets || []
                      : allTickets || []
                  }
                  initialSelectedIds={ticketIds}
                />
              )}
            </div>

            {/* discountStart and discountEnd input */}
            <div className="flex space-x-3">
              <div className="w-1/2 flex-col">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày bắt đầu khuyến mãi
                </label>
                <input
                  type="datetime-local"
                  placeholder="Ngày bắt đầu"
                  {...register("discountStart", {
                    required: "Ngày bắt đầu là bắt buộc",
                    validate: (value) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selectedDate = new Date(value);
                      return (
                        selectedDate >= today ||
                        "Ngày bắt đầu phải từ hôm nay trở đi"
                      );
                    },
                  })}
                  defaultValue={(() => {
                    const now = new Date();
                    const offset = now.getTimezoneOffset();
                    const localTime = new Date(
                      now.getTime() - offset * 60 * 1000,
                    );
                    return localTime.toISOString().slice(0, 16);
                  })()}
                  className={`w-full rounded-lg border border-gray-500 px-3 py-2 text-sm outline-none ${errors.discountStart ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                />
                {errors.discountStart && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.discountStart.message === "string"
                      ? errors.discountStart.message
                      : "Error!"}
                  </p>
                )}
              </div>

              <div className="w-1/2 flex-col">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Ngày kết thúc khuyến mãi
                </label>
                <input
                  type="datetime-local"
                  placeholder="Ngày kết thúc"
                  {...register("discountEnd", {
                    required: "Ngày kết thúc là bắt buộc",
                    validate: (value, { discountStart }) => {
                      const startDate = new Date(discountStart);
                      const endDate = new Date(value);
                      return (
                        endDate > startDate ||
                        "Ngày kết thúc phải sau ngày bắt đầu"
                      );
                    },
                  })}
                  className={`w-full rounded-lg border border-gray-500 px-3 py-2 text-sm outline-none ${errors.discountEnd ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                />
                {errors.discountEnd && (
                  <p className="mt-1 text-sm text-red-500">
                    {typeof errors.discountEnd.message === "string"
                      ? errors.discountEnd.message
                      : "Error!"}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              className="bg-main hover:bg-main-bold mt-4 mb-1 rounded-lg py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
      <Loading isLoading={isLoading} />
    </div>
  );
};

export default CreatePromotion;
