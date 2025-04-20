import { useState } from "react";
import { createPortal } from "react-dom";
import { IoCloseSharp } from "react-icons/io5";

const TicketModal = ({
  onTicketsSelected,
  closeModal,
  tickets,
  initialSelectedIds,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [ticketList, setTicketList] = useState(
    tickets.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price.toFixed(2),
      checked: initialSelectedIds
        ? initialSelectedIds.includes(ticket.id)
        : false,
    })),
  );

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setTicketList(
      ticketList.map((ticket) => ({ ...ticket, checked: newSelectAll })),
    );
  };

  const handleTicketCheck = (id) => {
    const updatedTickets = ticketList.map((ticket) =>
      ticket.id === id ? { ...ticket, checked: !ticket.checked } : ticket,
    );
    setTicketList(updatedTickets);
    setSelectAll(updatedTickets.every((t) => t.checked));
  };

  const handleDone = () => {
    const selectedIds = ticketList.filter((t) => t.checked).map((t) => t.id);
    onTicketsSelected(selectedIds);
    closeModal();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
      <div className="relative w-[600px] rounded-lg bg-white p-6 shadow-lg">
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

        <div className="flex items-center justify-between border-b border-gray-200 py-2 font-semibold">
          <div className="flex w-[60%] items-center">
            <input
              type="checkbox"
              id="selectAll"
              className="mr-2"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAll">Tên vé</label>
          </div>
          <div className="w-[40%]">Giá</div>
        </div>

        {ticketList.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between border-b border-gray-200 py-2"
          >
            <div className="flex w-[60%] items-center">
              <input
                type="checkbox"
                id={`ticket-${ticket.id}`}
                className="mr-2"
                checked={ticket.checked}
                onChange={() => handleTicketCheck(ticket.id)}
              />
              <label htmlFor={`ticket-${ticket.id}`}>{ticket.name}</label>
            </div>
            <div className="w-[40%]">${ticket.price}</div>
          </div>
        ))}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDone}
            className="cursor-pointer rounded-md bg-main px-4 py-2 text-white hover:bg-main-bold font-semibold"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TicketModal;
