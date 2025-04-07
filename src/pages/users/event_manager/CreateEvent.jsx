import { useState, useRef, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import StatusIcon from "components/UI/StatusIcon";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { RiCalendarEventFill, RiCalendarScheduleLine } from "react-icons/ri";
import { IoInformationCircleOutline } from "react-icons/io5";
import { ImBin } from "react-icons/im";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const CreateEvent = () => {
  const [eventType, setEventType] = useState("singleEvent");
  var toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    ["link"],

    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }],

    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];

  const modules = { toolbar: toolbarOptions };

  // các field và sub-field
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    getValues,
    trigger,
    setValue,
    control,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control, // Truyền control từ useForm
    name: "faqs", // Đặt tên cho mảng field trong form data
  });

  const onSubmit = (data) => {
    const eventLocationRequest = {
      address: data.address,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode,
    };

    // Tạo requestData mà không bao gồm các trường dư
    const { address, city, country, postalCode, ...otherData } = data;

    // Kết hợp các dữ liệu còn lại với eventLocationRequest
    const requestData = {
      ...otherData,
      eventLocationRequest: eventLocationRequest,
    };
    // Gửi requestData lên backend
    console.log("dữ liêu form", JSON.stringify(requestData)); // Để kiểm tra dữ liệu trước khi gửi
  };
  console.log(getValues("description"));

  const [isExpanded, setIsExpanded] = useState({
    title: false,
    location: false,
    datetime: false,
    faqs: false,
    description: false,
  });

  const handleExpandedSection = (field) => {
    console.log("expanded");
    setIsExpanded((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleBlur = async (field, e) => {
    console.log("blur");
    // Nếu click trong cùng div, không blur
    const clickedField = e.relatedTarget
      ?.closest("[data-field]")
      ?.getAttribute("data-field");
    if (clickedField === field) return;

    // Đóng trường 'datetime' khi 'location' được chọn trong trường hợp 'recurringEvent'
    if (eventType === "recurringEvent" && field === "datetime") {
      setIsExpanded((prevState) => ({
        ...prevState,
        datetime: false,
      }));
      return;
    }

    // Tìm config của field trong mảng
    const fieldDef = fieldConfig.find((f) => f.name === field);

    if (fieldDef.subFields) {
      // Trường hợp field nhóm (location, faqs...)
      const fieldsToValidate = fieldDef.subFields;
      const results = await Promise.all(
        fieldsToValidate.map((f) => trigger(f)),
      );
      const isValid = results.every((result) => result);
      const values = fieldsToValidate.map((f) => getValues(f));
      const hasAllValues = values.every((value) => value);

      if (!isValid || !hasAllValues) {
        // Nếu bất kỳ sub-field nào không hợp lệ hoặc trống, giữ section mở
        setIsExpanded((prevState) => ({
          ...prevState,
          [field]: true,
        }));
        return;
      }
    } else {
      // Trường hợp field đơn (name)
      const isValid = await trigger(field);
      const value = getValues(field);
      console.log("valid", isValid);
      if (!isValid || !value) {
        setIsExpanded((prevState) => ({
          ...prevState,
          [field]: true,
        }));
        return;
      }
    }

    // Nếu tất cả hợp lệ và có giá trị, đóng section
    setIsExpanded((prevState) => ({
      ...prevState,
      [field]: false,
    }));
  };

  const handleChangeEventType = (e) => {
    const value = e.target.value;
    setEventType(value);

    if (value === "recurringEvent") {
      setValue("eventDate", "");
      setValue("startTime", "");
      setValue("endTime", "");
      clearErrors("eventDate");
      clearErrors("startTime");
      clearErrors("endTime");
    }
  };

  console.log("a", isExpanded);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    if (!sidebarElement) return;

    const handleMouseEnter = () => {
      sidebarElement.style.overflowY = "auto";
    };
    const handleMouseLeave = () => {
      sidebarElement.style.overflowY = "hidden";
    };

    sidebarElement.addEventListener("mouseenter", handleMouseEnter);
    sidebarElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebarElement.removeEventListener("mouseenter", handleMouseEnter);
      sidebarElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <div
        ref={sidebarRef}
        className="h-screen w-1/4 overflow-y-hidden bg-white p-4"
      >
        <div className="mb-4 flex items-center">
          <span className="mr-2 text-blue-500">←</span>
          <span className="text-blue-500">Back to events</span>
        </div>
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <img
            alt="Event banner"
            className="h-20 w-full rounded-t-lg object-cover"
            height="50"
            src="https://storage.googleapis.com/a1aa/image/ABDP3ZpXOIbnAYbgJb8Vs2arxs3rOzoQvFD-uhwe_c8.jpg"
            width="100"
          />
          <h2 className="mt-2 text-xl font-semibold">FB are trend</h2>
          <div className="mt-2 flex items-center">
            <button className="rounded-lg bg-gray-200 px-3 py-1 text-gray-700">
              Draft ▼
            </button>
            <a className="ml-4 text-blue-600" href="#">
              Preview ↗
            </a>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold">Steps</h3>
        <ul className="space-y-4">
          <li className="flex items-center">
            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
              1
            </span>
            Build event page
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
              2
            </span>
            Manage dates and times
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
              3
            </span>
            Add tickets
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-sm text-gray-600">
              4
            </span>
            Publish
          </li>
        </ul>
      </div>

      <div className="w-3/4 overflow-y-auto px-25 py-8">
        {/* Title section */}
        <div
          data-field="title"
          tabIndex={0}
          className="hover:ring-main-bold mb-6 cursor-pointer rounded-lg border border-gray-300 px-5 py-3 transition-all duration-200 hover:ring-2"
          onClick={() => {
            if (!isExpanded.title) {
              handleExpandedSection("title");
            }
          }}
          onBlur={(e) => {
            handleBlur("title", e);
            // Cập nhật giá trị vào form khi mất focus (không cần sự kiện handlleSubmit của RHF)
            setValue("name", getValues("name"));
            setValue("summary", getValues("summary"));
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-main text-[1.313rem] font-bold">Event Title</h2>
            <StatusIcon
              isExpanded={isExpanded.title}
              errors={errors}
              getValues={getValues}
              field="title"
            />
          </div>

          <div className="mt-4">
            {(fieldConfig
              .find((f) => f.name === "title")
              .subFields.some((f) => !getValues(f)) ||
              isExpanded.title) && (
              <p className="mb-2 text-sm text-gray-500">
                Provide a clear and descriptive title that explains the essence
                of your event.
              </p>
            )}

            {/* name input */}
            <div className="mt-2">
              {isExpanded.title ? (
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.name ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                  placeholder="Name"
                  onBlur={async () => {
                    await trigger("name");
                  }}
                />
              ) : null}
              {errors.name && (
                <div className="-mt-2 mb-1 pl-2 text-xs text-red-500">
                  {typeof errors.name.message === "string"
                    ? errors.name.message
                    : "Error!"}
                </div>
              )}
            </div>

            {/* summary input */}
            <div className="mt-2">
              {isExpanded.title ? (
                <input
                  type="text"
                  {...register("summary", {
                    required: "Summary is required",
                  })}
                  className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.summary ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                  placeholder="Sumarry"
                  onBlur={async () => {
                    await trigger("summary");
                  }}
                />
              ) : null}
              {errors.summary && (
                <div className="-mt-2 mb-1 pl-2 text-xs text-red-500">
                  {typeof errors.summary.message === "string"
                    ? errors.summary.message
                    : "Error!"}
                </div>
              )}
            </div>

            {/* khi đã nhập và không lỗi */}
            {!errors.name &&
              getValues("name") &&
              !errors.summary &&
              getValues("summary") &&
              !isExpanded.title && (
                <div className="-mt-2">
                  <h2 className="text-2xl font-bold">
                    {getValues("name")}
                  </h2>
                  <p>{getValues("summary")}</p>
                </div>
              )}
          </div>
        </div>
        {/* Location section */}
        <div
          data-field="location"
          tabIndex={0}
          className="hover:ring-main-bold mb-6 cursor-pointer rounded-lg border border-gray-300 px-5 py-3 transition-all duration-200 hover:ring-2"
          onClick={() => {
            if (!isExpanded.location) {
              handleExpandedSection("location");
            }
          }}
          onBlur={(e) => {
            handleBlur("location", e);
            setValue("country", getValues("country"));
            setValue("city", getValues("city"));
            setValue("address", getValues("address"));
            setValue("postalCode", getValues("postalCode"));
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-main text-[1.313rem] font-bold">Location</h2>
            <StatusIcon
              isExpanded={isExpanded.location}
              errors={errors}
              getValues={getValues}
              field="location"
            />
          </div>

          {(fieldConfig
            .find((f) => f.name === "location")
            .subFields.some((f) => !getValues(f)) ||
            isExpanded.location) && (
            <p className="mt-4 mb-2 text-sm text-gray-500">
              Please provide a clear and detailed description of where your
              event will take place to help attendees easily find it.
            </p>
          )}

          {/* country input */}
          <div className="mt-2">
            {isExpanded.location ? (
              <input
                type="text"
                {...register("country", {
                  required: "Country is required",
                })}
                className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.country ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"} `}
                placeholder="Country"
                onBlur={async () => {
                  await trigger("country");
                }}
              />
            ) : null}
            {errors.country && (
              <div className="-mt-2 mb-1 pl-2 text-xs text-red-500">
                {typeof errors.country.message === "string"
                  ? errors.country.message
                  : "Error!"}
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-4">
            {isExpanded.location && (
              <>
                {/* city input */}
                <div className="flex w-1/3 flex-col">
                  <input
                    type="text"
                    {...register("city", {
                      required: "City is required",
                    })}
                    className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.city ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"}`}
                    placeholder="City"
                    onBlur={async () => {
                      await trigger("city");
                    }}
                  />
                  {errors.city && (
                    <div className="-mt-2 text-xs text-red-500">
                      {typeof errors.city.message === "string"
                        ? errors.city.message
                        : "Error!"}
                    </div>
                  )}
                </div>

                {/* Address input */}
                <div className="flex w-1/3 flex-col">
                  <input
                    type="text"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.address ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"}`}
                    placeholder="Address"
                    onBlur={async () => {
                      await trigger("address");
                    }}
                  />
                  {errors.address && (
                    <div className="-mt-2 text-xs text-red-500">
                      {typeof errors.address.message === "string"
                        ? errors.address.message
                        : "Error!"}
                    </div>
                  )}
                </div>

                {/* postalCode input */}
                <div className="flex w-1/3 flex-col">
                  <input
                    type="text"
                    {...register("postalCode", {
                      required: "postal Code is required",
                      pattern: {
                        value: /^\d+$/,
                        message: "postal Code must contain only numbers",
                      },
                    })}
                    className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.postalCode ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"}`}
                    placeholder="postal code"
                    onBlur={async () => {
                      await trigger("postalCode");
                    }}
                  />
                  {errors.postalCode && (
                    <div className="-mt-2 text-xs text-red-500">
                      {typeof errors.postalCode.message === "string"
                        ? errors.postalCode.message
                        : "Error!"}
                    </div>
                  )}
                </div>
              </>
            )}
            {/* khi đã nhập và không lỗi */}
            {!errors.country &&
              getValues("country") &&
              !errors.city &&
              getValues("city") &&
              !errors.address &&
              getValues("address") &&
              !errors.postalCode &&
              getValues("postalCode") &&
              !isExpanded.location && (
                <div>
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt size={18} className="text-main-bold" />
                    <p className="text-lg font-semibold">
                      {getValues("country")}
                    </p>
                  </div>
                  <p className="pl-6">{`${getValues("address")}, ${getValues("city")}, ${getValues("postalCode")}, ${getValues("country")}`}</p>
                </div>
              )}
          </div>
        </div>
        {/* DateTime section */}
        <div
          data-field="datetime"
          tabIndex={0}
          className="hover:ring-main-bold mb-6 cursor-pointer rounded-lg border border-gray-300 px-5 py-3 transition-all duration-200 hover:ring-2"
          onClick={() => {
            if (!isExpanded.datetime) {
              handleExpandedSection("datetime");
            }
          }}
          onBlur={(e) => {
            handleBlur("datetime", e);
            setValue("eventDate", getValues("eventDate"));
            setValue("startTime", getValues("startTime"));
            setValue("endTime", getValues("endTime"));
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-main text-[1.313rem] font-bold">
              Date and time
            </h2>
            {eventType === "recurringEvent" && !isExpanded.datetime ? (
              <StatusIcon
                isExpanded={false}
                errors={errors}
                getValues={getValues}
                field="check"
              />
            ) : (
              <StatusIcon
                isExpanded={isExpanded.datetime}
                errors={errors}
                getValues={getValues}
                field="datetime"
              />
            )}
          </div>

          {(fieldConfig
            .find((f) => f.name === "datetime")
            .subFields.some((f) => !getValues(f)) ||
            isExpanded.datetime) &&
            !(eventType === "recurringEvent" && !isExpanded.datetime) && (
              <p className="mt-4 mb-3 text-sm text-gray-500">
                Choose the event type and provide a detailed description of the
                timing to ensure attendees can easily follow and participate in
                the event.
              </p>
            )}

          {isExpanded.datetime && (
            <div className="flex flex-col">
              <h3 className="mb-3 text-[1.125rem] font-semibold">
                Type of event
              </h3>
              <div className="radio-input">
                {/* Single Event */}
                <div className="w-1/2">
                  <input
                    className="peer"
                    value="singleEvent"
                    name="value-radio"
                    id="singleEvent"
                    type="radio"
                    checked={eventType === "singleEvent"}
                    onChange={handleChangeEventType}
                  />
                  <label
                    htmlFor="singleEvent"
                    className="peer-checked:ring-main-bold peer-checked:border-main-bold flex items-center space-x-3 border-2 border-gray-200 peer-checked:ring-1"
                  >
                    <RiCalendarEventFill
                      size={25}
                      className={`text-main-bold`}
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900">Single Event</span>
                      <span className="text-xs text-gray-500">
                        For events that happen once
                      </span>
                    </div>
                  </label>
                </div>

                {/* Recurring Event */}
                <div className="w-1/2">
                  <input
                    className="peer"
                    value="recurringEvent"
                    name="value-radio"
                    id="recurringEvent"
                    type="radio"
                    checked={eventType === "recurringEvent"}
                    onChange={handleChangeEventType}
                  />
                  <label
                    htmlFor="recurringEvent"
                    className="peer-checked:ring-main-bold peer-checked:border-main-bold flex items-center space-x-3 border-2 border-gray-200 peer-checked:ring-1"
                  >
                    <FaRegCalendarAlt size={25} className="text-main-bold" />
                    <div className="flex flex-col">
                      <span className="text-gray-900">Recurring Event</span>
                      <span className="text-xs text-gray-500">
                        For timed entry and multiple days
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            {isExpanded.datetime && eventType === "singleEvent" && (
              <>
                <h3 className="mb-3 text-[1.125rem] font-semibold">
                  Date and time
                </h3>
                <div className="flex space-x-3">
                  {/* date and time input */}
                  <div className="flex w-1/2 flex-col">
                    <input
                      type="text"
                      {...register("eventDate", {
                        required: "Schedule date is required",
                      })}
                      className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.eventDate ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"}`}
                      placeholder="Date"
                      onBlur={async () => {
                        await trigger("eventDate");
                      }}
                    />
                    {errors.eventDate && (
                      <div className="-mt-2 text-xs text-red-500">
                        {typeof errors.eventDate.message === "string"
                          ? errors.eventDate.message
                          : "Error!"}
                      </div>
                    )}
                  </div>

                  {/* starttime input */}
                  <div className="flex w-1/4 flex-col">
                    <input
                      type="text"
                      {...register("startTime", {
                        required: "Start time is required",
                      })}
                      className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.startTime ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"}`}
                      placeholder="Start time"
                      onBlur={async () => {
                        await trigger("startTime");
                      }}
                    />
                    {errors.startTime && (
                      <div className="-mt-2 text-xs text-red-500">
                        {typeof errors.startTime.message === "string"
                          ? errors.startTime.message
                          : "Error!"}
                      </div>
                    )}
                  </div>

                  {/* endtime input */}
                  <div className="flex w-1/4 flex-col">
                    <input
                      type="text"
                      {...register("endTime", {
                        required: "End time is required",
                      })}
                      className={`mb-2 w-full rounded-lg border border-gray-500 px-4 py-2 outline-none ${errors.endTime ? "border-2 border-red-500" : "focus:ring-main focus:border-none focus:ring-2"}`}
                      placeholder="End time"
                      onBlur={async () => {
                        await trigger("endTime");
                      }}
                    />
                    {errors.endTime && (
                      <div className="-mt-2 text-xs text-red-500">
                        {typeof errors.endTime.message === "string"
                          ? errors.endTime.message
                          : "Error!"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {/* khi đã nhập và không lỗi */}
            {!errors.eventDate &&
            getValues("eventDate") &&
            !errors.startTime &&
            getValues("startTime") &&
            !errors.endTime &&
            getValues("endTime") &&
            !isExpanded.datetime ? (
              <div className="flex items-center space-x-3">
                <RiCalendarScheduleLine size={22} className="text-main-bold" />
                <p>{`${getValues("eventDate")}, ${getValues("startTime")}, ${getValues("endTime")}`}</p>
              </div>
            ) : (
              eventType === "recurringEvent" && (
                <div>
                  <div className="mb-2 flex items-center space-x-3">
                    <FaCalendarCheck size={18} className="text-main" />
                    <h4 className="font-semibold">You choose multiple dates</h4>
                  </div>
                  <div className="bg-main-light inline-block rounded-xl p-1 px-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-3">
                      <IoInformationCircleOutline size={18} />
                      <p>
                        You will need to add the eventDate and time later for
                        this recurring event.
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        {/* question and answer section */}
        <div
          data-field="faqs"
          tabIndex={0}
          className="hover:ring-main-bold mb-6 cursor-pointer rounded-lg border border-gray-300 px-5 py-3 transition-all duration-200 hover:ring-2"
          onClick={() => {
            if (!isExpanded.faqs) {
              handleExpandedSection("faqs");
            }
          }}
          onBlur={(e) => {
            handleBlur("faqs", e);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-main text-[1.313rem] font-bold">
                Question and answer
              </h3>
              <h5 className="text-sm text-gray-600">(Optional)</h5>
            </div>
            {!isExpanded.faqs &&
              getValues("faqs")?.length > 0 &&
              getValues("faqs").every(
                (faq) => faq.question?.trim() && faq.answer?.trim(),
              ) && (
                <StatusIcon
                  isExpanded={false}
                  errors={errors}
                  getValues={getValues}
                  field="check"
                />
              )}
          </div>

          {(isExpanded.faqs ||
            !getValues("faqs")?.length ||
            !getValues("faqs")?.some((faq) => faq.question || faq.answer)) && (
            <p className="mt-4 mb-2 text-sm text-gray-500">
              FAQ: Address common questions attendees may have regarding the
              event, including details about accessibility, facilities, and
              more.
            </p>
          )}

          {isExpanded.faqs &&
            fields.map((field, index) => (
              <div key={field.id} className="mb-4 flex items-start gap-4">
                <div className="flex-1">
                  {/* question input */}
                  <input
                    type="text"
                    {...register(`faqs.${index}.question`, {
                      required: "Question is required",
                    })}
                    className={`mb-2 w-full rounded-lg border px-4 py-2 outline-none ${
                      errors.faqs?.[index]?.question
                        ? "border-2 border-red-500"
                        : "focus:ring-main border-gray-400 focus:border-transparent focus:ring-2"
                    }`}
                    placeholder={`Question ${index + 1}`}
                    onBlur={async () => {
                      await trigger(`faqs.${index}.question`);
                    }}
                  />
                  {errors.faqs?.[index]?.question && (
                    <div className="-mt-1 mb-2 pl-1 text-xs text-red-500">
                      {errors.faqs[index].question.message}
                    </div>
                  )}
                  {/* answer textarea */}
                  <textarea
                    rows={3}
                    {...register(`faqs.${index}.answer`, {
                      required: "Answer is required",
                    })}
                    className={`mb-2 w-full rounded-lg border px-4 py-2 outline-none ${
                      errors.faqs?.[index]?.answer
                        ? "border-2 border-red-500"
                        : "focus:ring-main border-gray-400 focus:border-transparent focus:ring-2"
                    }`}
                    placeholder={`Answer ${index + 1}`}
                    onBlur={async () => {
                      await trigger(`faqs.${index}.answer`);
                    }}
                  />
                  {errors.faqs?.[index]?.answer && (
                    <div className="-mt-1 mb-2 pl-1 text-xs text-red-500">
                      {errors.faqs[index].answer.message}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-10 self-center text-red-600 hover:text-red-800"
                  title={`Xóa FAQ ${index + 1}`}
                >
                  <ImBin size={20} />
                </button>
              </div>
            ))}
          {(isExpanded.faqs ||
            !getValues("faqs")?.length ||
            !getValues("faqs")?.some((faq) => faq.question || faq.answer)) && (
            <button
              type="button"
              onClick={() => append({ question: "", answer: "" })}
              className="mt-4 rounded-md border border-dashed border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              + Add question
            </button>
          )}
          {!errors.faqs &&
            getValues("faqs")?.every(
              (faq) => faq.question?.trim() && faq.answer?.trim(),
            ) &&
            !isExpanded.faqs &&
            getValues("faqs").map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold">{`❓${index + 1}. ${faq.question}`}</h3>
                <div className="mt-2 mb-2 flex items-center space-x-4 rounded-2xl bg-[#f9fbfa] p-1 px-4">
                  <FaArrowRight />
                  <p className="flex-1 break-words whitespace-normal">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div
          data-field="description"
          tabIndex={0}
          className="hover:ring-main-bold mb-6 cursor-pointer rounded-lg border border-gray-300 px-5 py-3 transition-all duration-200 hover:ring-2"
          onClick={() => {
            if (!isExpanded.description) {
              handleExpandedSection("description");
            }
          }}
          onBlur={(e) => {
            handleBlur("description", e);
            setValue("description", getValues("description"));
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-main text-[1.313rem] font-bold">
                Event description
              </h2>
              <h5 className="text-sm text-gray-600">(Optional)</h5>
            </div>
            {!isExpanded.description &&
              getValues("description")
                ?.replace(/<[^>]*>/g, "")
                .trim() && (
                <StatusIcon
                  isExpanded={false}
                  errors={errors}
                  getValues={getValues}
                  field="check"
                />
              )}
          </div>

          <p className="mt-4 mb-2 text-sm text-gray-500">
            Provide a clear and engaging description of your event to help
            attendees know what to expect. (Optional, but recommended)
          </p>

          <div className="mt-4">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur} // Để trigger validation khi blur
                />
              )}
            />
            {errors.description && (
              <div className="-mt-2 mb-1 pl-2 text-xs text-red-500">
                {typeof errors.description.message === "string"
                  ? errors.description.message
                  : "Error!"}
              </div>
            )}
          </div>
        </div>

        <button type="button" onClick={handleSubmit(onSubmit)}>
          click me
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
