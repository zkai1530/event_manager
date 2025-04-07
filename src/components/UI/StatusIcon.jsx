import { FaCheck, FaPlus, FaTimes } from "react-icons/fa";

const StatusIcon = ({ isExpanded, errors, getValues, field }) => {
  const fieldConfig = [
    { name: "title", subFields: ["name", "summary"] },
    {
      name: "location",
      subFields: ["country", "city", "address", "postalCode"],
    },
    { name: "datetime", subFields: ["eventDate", "startTime", "endTime"] },
    { name: "faqs" },
    { name: "description" },
  ];

  let icon = null;
  let colorClass = "";

  if (!isExpanded && field === "check") {
    colorClass = "bg-[#4BE1A0]";
    icon = <FaCheck size={20} className="text-white" />;
  } else {
    // Tìm cấu hình của field trong mảng
    const fieldDef = fieldConfig.find((f) => f.name === field);

    if (fieldDef && fieldDef.subFields) {
      // Trường hợp field nhóm (location, qas, ...)
      const subFields = fieldDef.subFields;
      const hasErrors = subFields.some((subField) => errors[subField]); // Kiểm tra lỗi trực tiếp
      const allValuesFilled = subFields.every((subField) =>
        getValues(subField),
      ); // Kiểm tra tất cả sub-field có giá trị

      if (isExpanded) {
        if (hasErrors) {
          // Nếu có lỗi
          colorClass = "bg-red-50";
          icon = <FaTimes size={20} className="text-red-500" />;
        } else {
          // Nếu không có lỗi
          colorClass = null;
        }
      } else {
        if (allValuesFilled) {
          // Nếu đóng và có giá trị
          colorClass = "bg-[#4BE1A0]";
          icon = <FaCheck size={20} className="text-white" />;
        } else {
          // Nếu đóng và không có giá trị
          colorClass = "bg-cyan-50";
          icon = <FaPlus size={20} className="text-main-bold" />;
        }
      }
    } else {
      // Trường hợp field đơn (title,...)
      const value = getValues(field);
      const hasError = errors[field];

      if (isExpanded) {
        if (hasError) {
          // Nếu có lỗi
          colorClass = "bg-red-50";
          icon = <FaTimes size={20} className="text-red-500" />;
        } else {
          // Nếu không có lỗi
          colorClass = null;
        }
      } else {
        if (value) {
          // Nếu đóng và có giá trị
          colorClass = "bg-[#4BE1A0]";
          icon = <FaCheck size={20} className="text-white" />;
        } else {
          // Nếu đóng và không có giá trị
          colorClass = "bg-cyan-50";
          icon = <FaPlus size={20} className="text-main-bold" />;
        }
      }
    }
  }

  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full ${colorClass}`}
    >
      {icon}
    </div>
  );
};

export default StatusIcon;
