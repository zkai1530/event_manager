import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoCloseSharp } from "react-icons/io5";

const ScheduleModal = ({
  onSchedulesSelected,
  closeModal,
  schedules,
  initialSelectedIds,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [scheduleList, setScheduleList] = useState(
    schedules.map((schedule) => ({
      id: schedule.scheduleId,
      date: schedule.scheduleDate,
      startTime: schedule.startTime.slice(0, 5),
      endTime: schedule.endTime.slice(0, 5),
      checked: initialSelectedIds
        ? initialSelectedIds.includes(schedule.scheduleId)
        : false,
    })),
  );
  const [searchDate, setSearchDate] = useState("");
  const [filteredScheduleList, setFilteredScheduleList] =
    useState(scheduleList);

  useEffect(() => {
    if (searchDate.trim() === "") {
      setFilteredScheduleList(scheduleList); 
    } else {
      const filtered = scheduleList.filter(
        (schedule) => schedule.date === searchDate, 
      );
      setFilteredScheduleList(filtered);
    }
  }, [searchDate, scheduleList]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updatedScheduleList = scheduleList.map((schedule) => ({
      ...schedule,
      checked: filteredScheduleList.some((s) => s.id === schedule.id)
        ? newSelectAll
        : schedule.checked,
    }));
    setScheduleList(updatedScheduleList);
  };

  const handleScheduleCheck = (id) => {
    const updatedSchedules = scheduleList.map((schedule) =>
      schedule.id === id
        ? { ...schedule, checked: !schedule.checked }
        : schedule,
    );
    setScheduleList(updatedSchedules);
    setSelectAll(
      updatedSchedules.every(
        (s) => !filteredScheduleList.some((fs) => fs.id === s.id) || s.checked,
      ),
    );
  };

  const handleDone = () => {
    const selectedIds = scheduleList.filter((s) => s.checked).map((s) => s.id);
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
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="focus:ring-main w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
          />
          {/* {searchDate && (
            <button
              onClick={() => setSearchDate("")} 
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              <IoCloseSharp size={16} />
            </button>
          )} */}
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
        <div className="max-h-[300px] overflow-y-auto">
          {filteredScheduleList.map((schedule) => (
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
                <label htmlFor={`schedule-${schedule.id}`}>
                  {schedule.date}
                </label>
              </div>
              <div className="w-[30%]">{schedule.startTime}</div>
              <div className="w-[30%]">{schedule.endTime}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleDone}
            className="bg-main hover:bg-main-bold cursor-pointer rounded-md px-4 py-2 font-semibold text-white"
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
