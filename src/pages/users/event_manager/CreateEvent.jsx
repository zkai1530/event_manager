import { useState, useRef, useEffect, useCallback } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import StatusIcon from "@/components/ui/StatusIcon";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { AiFillFileImage } from "react-icons/ai";
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
import Loading from "@/components/ui/Loading";
import { formatSchedule } from "utils/formatSchedule";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

const CreateEvent = () => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState("singleEvent");
  const [imageUpload, setImageUpload] = useState(null); // để hiển thị hình ảnh upload
  const [fileNameImage, setFileNameImage] = useState("Không có file được chọn"); // lưu tên file hình ảnh upload
  const [fileUpload, setFileUpload] = useState(null); // lưu file ảnh upload để gửi lên server
  const fileInputRef = useRef(null);
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
      capacity: 500,
      eventType: isEmptyTime ? "RECURRING" : "SINGLE",
    };
    console.log("dữ liệu", requestData);

    const formData = new FormData();
    formData.append(
      "eventRequest",
      new Blob([JSON.stringify(requestData)], { type: "application/json" }),
    );
    if (fileUpload) {
      formData.append("image", fileUpload);
    }

    console.log(fileUpload);

    try {
      setIsLoading(true);
      if (eventId) {
        const data = await updateEvent(eventId, formData, token);
        if (data.message === "Update event was successfully!") {
          Swal.fire({
            title: "Cập nhật sự kiện thành công!",
            text: `Sự kiện của bạn đã được cập nhật!.`,
            icon: "success",
          });
          console.log(data.data);
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Cập nhật sự kiện không thành công!.`,
            icon: "error",
          });
        }
      } else {
        const data = await createEvent(formData, token);
        if (data.message === "Create event was successfully!") {
          Swal.fire({
            title: "Thêm sự kiện thành công!",
            text: `Sự kiện của bạn đã được tạo!.`,
            icon: "success",
          });
          console.log(data.data);
          // data.data is eventId
          navigate(`/manage/event/${data.data}/schedules`);
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Thêm sự kiện không thành công!.`,
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Create/Update event error", error);
      Swal.fire({
        title: "Lỗi!",
        text: `Thêm sự kiện không thành công!.`,
        icon: "error",
      });
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
  const [haveTicket, setHaveTicket] = useState(false);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      getEventInfoById(eventId)
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

          if (data.imageUrl) {
            setImageUpload(data.imageUrl);
          }

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
    }
  }, [eventId, setValue, setEventType]);

  if (!isReady && eventId) {
    return null;
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileUpload(event.target.files[0]);
      setFileNameImage(file.name);
      setImageUpload(URL.createObjectURL(file));
    }
  };

  const handleDelete = () => {
    setFileUpload(null);
    setFileNameImage("Không có file được chọn");
    setImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex min-h-screen px-25">
      <div className="">
        <div
          className="border-main flex h-auto min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2"
          onClick={handleDivClick}
        >
          <input
            type="file"
            accept="image/*"
            className="input-image"
            name="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {imageUpload ? (
            <img
              src={imageUpload}
              className="h-[300px] w-full rounded-lg object-cover"
              alt=""
            />
          ) : (
            <>
              <MdCloudUpload className="text-main" size={100} />
              <p>Chọn file để tải ảnh lên</p>
            </>
          )}
        </div>
        <section className="mt-2 mb-4 flex w-100">
          <MdDelete className="text-main" size={25} onClick={handleDelete} />
        </section>
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
            <h2 className="font-main text-[1.313rem] font-bold">Tên sự kiện</h2>
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
                Hãy cung cấp một tiêu đề rõ ràng và tóm tắt ngắn gọn về nội dung
                sự kiện của bạn.
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
                  placeholder="Tên sự kiện"
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
                  placeholder="Tóm tắt sơ lược"
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
            <h2 className="font-main text-[1.313rem] font-bold">Địa điểm</h2>
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
              Hãy cung cấp một mô tả rõ ràng và chi tiết về địa điểm tổ chức sự
              kiện của bạn để giúp người tham gia dễ dàng tìm thấy.
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
                placeholder="Đất nước"
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
                    placeholder="Thành phố"
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
                    placeholder="Địa chỉ"
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
                    placeholder="Mã bưu chính"
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
              Ngày và giờ sự kiện
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
                Chọn loại sự kiện và cung cấp mô tả chi tiết về thời gian để đảm
                bảo người tham gia có thể dễ dàng theo dõi và tham gia.
              </p>
            )}

          {isExpanded.datetime && (
            <div className="flex flex-col">
              <h3 className="mb-3 text-[1.125rem] font-semibold">
                Chọn loại sự kiện
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
                      <span className="text-gray-900">Sự kiện một lần</span>
                      <span className="text-xs text-gray-500">
                        Dành cho các sự kiện chỉ diễn ra một lần.
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
                        Đã có vé
                      </div>
                    )}
                    <FaRegCalendarAlt size={25} className="text-main-bold" />
                    <div className="flex flex-col">
                      <span className="text-gray-900">Sự kiện định kỳ</span>
                      <span className="text-xs text-gray-500">
                        Dành cho sự kiện có thời gian diễn ra linh hoạt.
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
                      placeholder="Ngày"
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
                      placeholder="Giờ bắt đầu"
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
                      placeholder="Giờ kết thúc"
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
                    <h4 className="font-semibold">
                      Bạn đã chọn sự kiện định kì
                    </h4>
                  </div>
                  <div className="bg-main-light inline-block rounded-xl p-1 px-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-3">
                      <IoInformationCircleOutline size={18} />
                      <p>
                        Bạn sẽ thêm ngày và giờ của sự kiện ở bước tiếp theo.
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
              <h3 className="font-main text-[1.313rem] font-bold">Q&A</h3>
              <h5 className="text-sm text-gray-600">(Không bắt buộc)</h5>
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
              Q&A: Trả lời các câu hỏi thường gặp mà người tham gia có thể muốn
              biết về sự kiện (ví dụ: về độ tuổi, chi tiết địa điểm sự kiện, chi
              tiết về người dẫn sự kiện...).
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
                    placeholder={`Câu hỏi ${index + 1}`}
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
                    placeholder={`Câu trả lời ${index + 1}`}
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
              + Thêm câu hỏi
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
                Mô tả sự kiện
              </h2>
              <h5 className="text-sm text-gray-600">(Không bắt buộc)</h5>
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
            Hãy cung cấp mô tả rõ ràng và hấp dẫn về sự kiện của bạn để giúp
            người tham gia biết những gì họ có thể mong đợi. (Không bắt buộc,
            nhưng khuyến khích)
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
        {/* <button
          onClick={handleCreateFakeEvent}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Tạo sự kiện & sang bước 2
        </button> */}
        {/* <div className="flex justify-end">
          <button
            type="button"
            className="bg-secondary1 hover:bg-emphasis rounded px-4 py-2 text-white"
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
      </div>
      <Loading isLoading={isLoading} />
    </div>
  );
};

export default CreateEvent;
