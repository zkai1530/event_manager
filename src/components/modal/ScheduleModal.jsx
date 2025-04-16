import { useState } from "react";
import { createPortal } from "react-dom";
import { IoCloseSharp } from "react-icons/io5";

const ScheduleModal = ({ onSchedulesSelected, closeModal }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      date: "2025-04-15",
      startTime: "09:00",
      endTime: "11:00",
      checked: false,
    },
    {
      id: 2,
      date: "2025-04-16",
      startTime: "13:00",
      endTime: "15:30",
      checked: false,
    },
    {
      id: 3,
      date: "2025-04-17",
      startTime: "18:00",
      endTime: "20:00",
      checked: false,
    },
  ]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSchedules(
      schedules.map((schedule) => ({ ...schedule, checked: newSelectAll })),
    );
  };

  const handleScheduleCheck = (id) => {
    const updatedSchedules = schedules.map((schedule) =>
      schedule.id === id
        ? { ...schedule, checked: !schedule.checked }
        : schedule,
    );
    setSchedules(updatedSchedules);

    const allChecked = updatedSchedules.every((s) => s.checked);
    setSelectAll(allChecked);
  };

  const handleDone = () => {
    const selectedIds = schedules.filter((s) => s.checked).map((s) => s.id);
    onSchedulesSelected(selectedIds);
    closeModal();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(57,54,79,0.8)]">
      <div className="relative w-[600px] rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chọn lịch trình</h2>
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
          <div className="flex w-[40%] items-center">
            <input
              type="checkbox"
              id="selectAll"
              className="mr-2"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAll">Ngày tổ chức</label>
          </div>
          <div className="w-[30%]">Giờ bắt đầu</div>
          <div className="w-[30%]">Giờ kết thúc</div>
        </div>

        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center justify-between border-b border-gray-200 py-2"
          >
            <div className="flex w-[40%] items-center">
              <input
                type="checkbox"
                id={`schedule-${schedule.id}`}
                className="mr-2"
                checked={schedule.checked}
                onChange={() => handleScheduleCheck(schedule.id)}
              />
              <label htmlFor={`schedule-${schedule.id}`}>{schedule.date}</label>
            </div>
            <div className="w-[30%]">{schedule.startTime}</div>
            <div className="w-[30%]">{schedule.endTime}</div>
          </div>
        ))}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDone}
            className="bg-main hover:bg-main-bold cursor-pointer rounded-md px-4 py-2 text-white"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ScheduleModal;
