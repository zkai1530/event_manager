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
import EventStepper from "components/layout/EventStepper";
import { useNavigate, useParams } from "react-router-dom";
import {
  createEvent,
  getEventInfoById,
  updateEvent,
} from "services/user/eventService";
import Loading from "components/UI/Loading";
import { formatSchedule } from "utils/formatSchedule";

const CreateEvent = () => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
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

  const onSubmit = async (data) => {
    const { address, city, country, postalCode, ...rest } = data;

    // Kiểm tra xem date, startTime, endTime có đều rỗng hay không
    const isEmptyTime =
      !getValues("eventDate") &&
      !getValues("startTime") &&
      !getValues("endTime");

    const requestData = {
      ...rest,
      eventLocationRequest: { address, city, country, postalCode },
      imageUrl: "https://example.com/event-image.jpg",
      capacity: 500,
      eventType: isEmptyTime ? "RECURRING" : "SINGLE",
    };
    console.log("dữ liệu", requestData);

    try {
      setIsLoading(true);
      if (eventId) {
        await updateEvent(eventId, requestData, token);
      } else {
        const eventId = await createEvent(requestData, token);
        console.log(eventId);
        // data is eventId
        navigate(`/manage/event/${eventId}/schedules`);
      }
    } catch (error) {
      console.error("Create/Update event error", error);
    } finally {
      setIsLoading(false);
    }
  };

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
  const navigate = useNavigate();
  const handleCreateFakeEvent = () => {
    // Giả lập tạo thành công event và có eventId = 123
    const fakeEventId = "123";
    navigate(`/manage/event/${fakeEventId}/tickets`);
  };
  const { eventId } = useParams();
  const [haveTicket, setHaveTicket] = useState(true);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    getEventInfoById(eventId, token)
      .then((data) => {
        console.log("tui ne", data);
        if (!data) {
          setIsReady(false);
          return;
        }

        const fetchedData = {
          name: data.name,
          summary: data.summary,
          country: data.eventLocation.country,
          city: data.eventLocation.city,
          address: data.eventLocation.address,
          postalCode: data.eventLocation.postalCode,
          description: data.description,
          faqs: data.faqs,
        };

        if (data.eventType === "SINGLE") {
          // console.log(data.schedule.scheduleDate)
          setEventType("singleEvent");
          fetchedData.eventDate = data.schedules[0].scheduleDate;
          fetchedData.startTime = data.schedules[0].startTime;
          fetchedData.endTime = data.schedules[0].endTime;
        } else if (data.eventType === "RECURRING") {
          setEventType("recurringEvent");
        }

        // Đổ dữ liệu vào form
        Object.entries(fetchedData).forEach(([key, value]) => {
          setValue(key, value);
        });

        setIsReady(true);
      })
      .catch((err) => {
        console.log("getEventInfoById", err);
        setIsReady(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [eventId, setValue, setEventType, token]);

  if (!isReady) {
    return null; // Nếu không có eventId hợp lệ (không phải 123), không render form
  }

  return (
    <div className="flex min-h-screen px-25">
      <div className="">
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
                  <h2 className="text-2xl font-bold">{getValues("name")}</h2>
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
                    className={`peer`}
                    value="singleEvent"
                    name="value-radio"
                    id="singleEvent"
                    type="radio"
                    checked={eventType === "singleEvent"}
                    onChange={handleChangeEventType}
                    disabled={haveTicket && eventType === "recurringEvent"}
                  />
                  <label
                    htmlFor="singleEvent"
                    className={`peer-checked:ring-main-bold peer-checked:border-main-bold flex items-center space-x-3 border-2 border-gray-200 peer-checked:ring-1 ${haveTicket && eventType === "recurringEvent" ? "!cursor-not-allowed opacity-60" : "cursor-pointer"}`}
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
                <div className="group relative w-1/2">
                  <input
                    className={`peer`}
                    value="recurringEvent"
                    name="value-radio"
                    id="recurringEvent"
                    type="radio"
                    checked={eventType === "recurringEvent"}
                    onChange={handleChangeEventType}
                    disabled={haveTicket && eventType === "singleEvent"}
                  />
                  <label
                    // title={
                    //   haveTicket && eventType === "singleEvent"
                    //     ? "Đã có vé"
                    //     : ""
                    // }
                    htmlFor="recurringEvent"
                    className={`peer-checked:ring-main-bold peer-checked:border-main-bold flex items-center space-x-3 border-2 border-gray-200 peer-checked:ring-1 ${haveTicket && eventType === "singleEvent" ? "!cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {haveTicket && eventType === "singleEvent" && (
                      <div className="absolute -top-12 left-1/2 z-10 hidden w-full max-w-full -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs break-words whitespace-normal text-white shadow-md group-hover:block">
                        Đã có vé ưenr ưenro bưeu rbweb rưhe oihweoi rhwei hrwieh
                        riowehr ưerg i
                      </div>
                    )}
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
                  {/* date input */}
                  <div className="flex w-1/2 flex-col">
                    <input
                      type="date"
                      {...register("eventDate", {
                        required: "Schedule date is required",
                        validate: {
                          isFuture: (value) =>
                            value > new Date().toISOString().split("T")[0] ||
                            "Event date must be after today",
                        },
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
                      type="time"
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
                      type="time"
                      {...register("endTime", {
                        required: "End time is required",
                        validate: {
                          afterStart: (value) =>
                            !getValues("startTime") ||
                            value > getValues("startTime") ||
                            "End time must be after start time",
                        },
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
                {(() => {
                  const scheduleItem = {
                    scheduleDate: getValues("eventDate"),
                    startTime: getValues("startTime"),
                    endTime: getValues("endTime"),
                  };
                  const formattedSchedule = formatSchedule(scheduleItem);
                  return (
                    <p>{`${formattedSchedule.dayOfWeek}, ${formattedSchedule.formattedDate}, ${formattedSchedule.formattedStartTime} - ${formattedSchedule.formattedEndTime}`}</p>
                  );
                })()}
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
        <button
          onClick={handleCreateFakeEvent}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Tạo sự kiện & sang bước 2
        </button>
        {/* <div className="flex justify-end">
          <button
            type="button"
            className="bg-secondary hover:bg-emphasis rounded px-4 py-2 text-white"
            onClick={handleSubmit(onSubmit)}
          >
            {!eventId ? "Thêm mới" : "Chỉnh sửa"}
          </button>
        </div> */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className={`relative w-[130px] rounded border-none bg-[#f18927] px-2 py-2 font-bold tracking-wider text-white uppercase opacity-80 shadow-[0px_7px_2px_#d86f0e,0px_8px_5px_#000] transition-all duration-200 hover:opacity-100 active:top-1 active:shadow-[0px_3px_2px_#d86f0e,0px_3px_5px_#000]`}
          >
            {!eventId ? "Thêm mới" : "Chỉnh sửa"}
          </button>
        </div>

        <Loading isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CreateEvent;
