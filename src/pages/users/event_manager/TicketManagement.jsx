import ScheduleModal from "components/modal/ScheduleModal";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { IoEllipsisVertical, IoTicketOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useEventRoute } from "utils/useEventRoute";
import CreateTicket from "./CreateTicket";

const TicketManagement = () => {
  const { eventId, section } = useEventRoute();

  return (
    <div className="px-2">
      <div className="mb-8 flex justify-between">
        <h2 className="font-main py-1 text-3xl font-bold">Vé sự kiện</h2>
      </div>
      <div className="flex">
        <div className="mb-2 items-center justify-center space-x-10">
          <Link
            to={`/manage/event/${eventId}/tickets`}
            className={`h-full cursor-pointer pb-[10px] text-[17px] font-semibold text-gray-500 duration-100 ${section === "tickets" ? "border-main text-main-bold border-b-2" : "hover:text-black"}`}
          >
            Thông tin vé
          </Link>
          <Link
            to={`/manage/event/${eventId}/promotions`}
            className={`h-full cursor-pointer pb-[10px] text-[17px] font-semibold text-gray-500 duration-100 ${section === "promotions" ? "border-main text-main-bold border-b-2" : "hover:text-black"}`}
          >
            Khuyến mãi
          </Link>
        </div>
      </div>
      <hr className="text-gray-300" />

      <div className="mt-4">
        {section === "tickets" && <CreateTicket />}
        {/* {section === "promotions" && <PromotionForm />} */}
      </div>
    </div>
  );
};

export default TicketManagement;
