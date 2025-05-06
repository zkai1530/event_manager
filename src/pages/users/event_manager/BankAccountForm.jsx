import { useState, useEffect } from "react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { getEventInfoById, publishEvent } from "services/user/eventService";
import {
  addBankAccount,
  getMyBankAccount,
  updateBankAccount,
} from "@/services/user/userService";
import Swal from "sweetalert2";
import { FormatPrice } from "@/utils/formatPrice";
import { MdOutlineReduceCapacity } from "react-icons/md";

const BankAccountSetup = () => {
  const { eventId } = useParams();
  const [banks, setBanks] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [bankAccount, setBankAccount] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null); // State để lưu giá trị Select
  const [formData, setFormData] = useState({
    bankName: "",
    bankShortName: "",
    accountNumber: "",
    accountName: "",
    logo: "",
    event_type: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Gọi API VietQR để lấy danh sách ngân hàng
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.code === "00") {
          setBanks(result.data);
        } else {
          setError("Không thể tải danh sách ngân hàng.");
        }
      } catch (err) {
        setError("Lỗi khi gọi API ngân hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId || !token) return;
      setLoading(true);
      try {
        const [eventData, bankData] = await Promise.all([
          getEventInfoById(eventId),
          getMyBankAccount(token),
        ]);

        setEventInfo(eventData);

        setBankAccount(bankData || null);
        if (bankData) {
          setFormData({
            bankName: bankData.bankName || "",
            bankShortName: bankData.bankShortName || "",
            accountNumber: bankData.accountNumber || "",
            accountName: bankData.accountName || "",
            logo: bankData.logo || "",
            event_type: "",
            category: "",
          });
          const matchedBank = banks.find(
            (bank) => bank.name === bankData.bankName,
          );
          if (matchedBank) {
            setSelectedBank({
              value: matchedBank.name,
              label: `${matchedBank.name} (${matchedBank.shortName})`,
            });
          }
        }
      } catch (err) {
        setError("Lỗi khi tải thông tin sự kiện hoặc tài khoản ngân hàng.");
        console.error("fetchData", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, token, banks]);

  const handleBankChange = (selectedOption) => {
    setSelectedBank(selectedOption);
    const selectedBankData = banks.find(
      (bank) => bank.name === selectedOption?.value,
    );
    setFormData({
      ...formData,
      bankName: selectedOption?.value || "",
      bankShortName: selectedBankData ? selectedBankData.shortName : "",
      logo: selectedBankData ? selectedBankData.logo : "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (selectedOption) => {
    setFormData({ ...formData, event_type: selectedOption?.value || "" });
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData({ ...formData, category: selectedOption?.value || "" });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!bankAccount) {
      setError("Vui lòng thêm tài khoản ngân hàng trước khi publish.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const data = await publishEvent(eventId, token);
      if (data.message === "Event published successfully!") {
        Swal.fire({
          title: "Publish sự kiện thành công!",
          text: `Sự kiện đã được publish!.`,
          icon: "success",
        });
        console.log(data.data);
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: `Publish sự kiện không thành công!.`,
          icon: "error",
        });
      }
    } catch (error) {
      console.error("publishEvent", error.response.data);
      if (error.response.data.message === "Event is already published!") {
        Swal.fire({
          title: "Sự kiện đã được publish!",
          text: `Sự kiện đã được publish!.`,
          icon: "warning",
        });
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: `Publish sự kiện không thành công!.`,
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateBank = async () => {
    if (
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.accountName
    ) {
      setError("Vui lòng điền đầy đủ thông tin tài khoản.");
      return;
    }

    const bankData = {
      bankName: formData.bankName,
      bankShortName: formData.bankShortName,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      logo: formData.logo,
    };
    console.log(bankData);

    setLoading(true);
    try {
      if (bankAccount) {
        const updatedBank = await updateBankAccount(bankData, token);
        if (updatedBank.message === "Request was successful!") {
          Swal.fire({
            title: "Cập nhật thông tin ngân hàng thành công!",
            text: `Thông tin tài khoản ngân hàng của bạn đã được cập nhật!.`,
            icon: "success",
          });
          console.log(updatedBank.data);
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Cập nhật thông tin ngân hàng không thành công!.`,
            icon: "error",
          });
        }
        setBankAccount(updatedBank);
      } else {
        const newBank = await addBankAccount(bankData, token);
        if (newBank.message === "Request was successful!") {
          Swal.fire({
            title: "Thêm thông tin ngân hàng thành công!",
            text: `Thông tin tài khoản ngân hàng của bạn đã được thêm!.`,
            icon: "success",
          });
          console.log(newBank.data);
        } else {
          Swal.fire({
            title: "Lỗi!",
            text: `Thêm thông tin ngân hàng không thành công!.`,
            icon: "error",
          });
        }
        setBankAccount(newBank);
      }
      setError("");
    } catch (err) {
      Swal.fire({
        title: "Lỗi!",
        text: `Thêm/Cập nhật thông tin ngân hàng không thành công!.`,
        icon: "error",
      });
      setError("Lỗi khi lưu thông tin tài khoản ngân hàng.");
    } finally {
      setLoading(false);
    }
  };

  const bankOptions = banks.map((bank) => ({
    value: bank.name,
    label: `${bank.name} (${bank.shortName})`,
    shortName: bank.shortName,
  }));

  const typeOptions = [
    { value: "Seminar or Talk", label: "Seminar or Talk" },
    { value: "Multiple Dates", label: "Multiple Dates" },
  ];
  const categoryOptions = [
    { value: "School Activities", label: "School Activities" },
    { value: "Dinner", label: "Dinner" },
  ];

  const customFilterOption = (option, rawInput) => {
    const input = rawInput.toLowerCase();
    return (
      option.label.toLowerCase().includes(input) ||
      option.data.shortName?.toLowerCase().includes(input)
    );
  };

  const isBankAdded = !!bankAccount;

  return (
    <div className="px-2">
      <div className="rounded-2xl bg-white p-1">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800">Xem lại sự kiện</h2>
          <p className="mt-2 text-gray-500">
            Xem thông tin sự kiện trước khi publish.
          </p>
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          {eventInfo && (
            <div className="md:w-1/2">
              <div className="rounded-lg bg-gray-50 p-4 shadow-sm">
                <img
                  src={
                    eventInfo.imageUrl || "https://via.placeholder.com/300x150"
                  }
                  alt="Event banner"
                  className="h-40 w-full rounded-lg object-cover"
                />
                <h3 className="mt-2 text-lg font-semibold">{eventInfo.name}</h3>
                <p className="text-sm text-gray-600">
                  {eventInfo.eventType === "RECURRING" ||
                  eventInfo.schedules.length > 1
                    ? "Multiple Dates"
                    : eventInfo.schedules[0]?.scheduleDate}
                </p>
                <p className="text-sm text-gray-600">
                  {eventInfo.eventLocation.address},{" "}
                  {eventInfo.eventLocation.city},{" "}
                  {eventInfo.eventLocation.country}
                  <p className="text-md flex font-semibold text-gray-900">
                    {FormatPrice(
                      Math.min(
                        ...eventInfo.schedules.flatMap((s) =>
                          s.ticketSchedules.map((t) => t.price),
                        ),
                      ),
                    )}{" "}
                    -{" "}
                    {FormatPrice(
                      Math.max(
                        ...eventInfo.schedules.flatMap((s) =>
                          s.ticketSchedules.map((t) => t.price),
                        ),
                      ),
                    )}{" "}
                    <div className="ml-8 flex items-center">
                      <MdOutlineReduceCapacity />
                      <span>{eventInfo.capacity}</span>
                    </div>
                  </p>
                </p>
              </div>
            </div>
          )}
          <div className="md:w-1/2">
            <div className="rounded-lg bg-gray-50 p-4 shadow-sm">
              <h2 className="mb-2 text-xl font-bold">Danh mục và chủ đề</h2>
              <p className="mb-4 text-sm text-gray-500">
                Việc chọn đúng loại và danh mục sẽ giúp sự kiện của bạn dễ được
                tìm thấy hơn khi người dùng tìm kiếm.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Danh mục
                  </label>
                  <Select
                    options={typeOptions}
                    onChange={handleTypeChange}
                    placeholder="Chọn danh mục"
                    isClearable
                    className="mt-1 text-gray-700"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.375rem",
                        borderColor: "#d1d5db",
                        padding: "0.25rem",
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? "#dbeafe" : "white",
                        color: "#1f2937",
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                      }),
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chủ đề
                  </label>
                  <Select
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                    placeholder="Chọn chủ đề"
                    isClearable
                    className="mt-1 text-gray-700"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "0.375rem",
                        borderColor: "#d1d5db",
                        padding: "0.25rem",
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? "#dbeafe" : "white",
                        color: "#1f2937",
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.375rem",
                        marginTop: "0.25rem",
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-main mt-6 mb-8 rounded-r-lg border-l-4 bg-blue-50 p-4">
          <p className="font-medium text-blue-700">
            <span className="font-bold">Quan trọng:</span> Cần thêm tài khoản
            ngân hàng để nhận thanh toán và publish sự kiện.
          </p>
        </div>
        {error && (
          <p className="mb-6 text-center font-medium text-red-500">{error}</p>
        )}
        {loading && (
          //   <p className="mb-6 text-center text-gray-500">Đang tải...</p>
          <p></p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Ngân hàng
            </label>
            <Select
              options={bankOptions}
              onChange={handleBankChange}
              value={selectedBank} // Set giá trị hiển thị của Select
              placeholder="Chọn ngân hàng"
              isClearable
              isDisabled={loading}
              filterOption={customFilterOption}
              className="text-gray-700"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                  padding: "0.25rem",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
                option: (base, { isFocused }) => ({
                  ...base,
                  backgroundColor: isFocused ? "#dbeafe" : "white",
                  color: "#1f2937",
                  padding: "0.75rem",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "0.5rem",
                  marginTop: "0.25rem",
                }),
              }}
            />
          </div>
          <div>
            <label className="focus:ring-main mb-2 block font-medium text-gray-700">
              Mã ngân hàng
            </label>
            <input
              type="text"
              name="bankShortName"
              value={formData.bankShortName}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-gray-600"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Số tài khoản
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="focus:ring-main w-full rounded-lg border border-gray-300 p-3 transition focus:ring-2 focus:outline-none"
              placeholder="Nhập số tài khoản"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Tên tài khoản
            </label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleInputChange}
              className="focus:ring-main w-full rounded-lg border border-gray-300 p-3 transition focus:ring-2 focus:outline-none"
              placeholder="Nhập tên tài khoản"
            />
          </div>
        </div>
        {formData.logo && (
          <div className="mt-4 flex justify-center">
            <img
              src={formData.logo}
              alt="Bank Logo"
              className="h-14 w-auto rounded-md object-contain shadow-sm transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleAddOrUpdateBank}
            className={`w-full rounded-lg p-3 font-semibold transition ${
              formData.bankName &&
              formData.accountNumber &&
              formData.accountName
                ? "bg-green-600 text-white hover:bg-green-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
            disabled={
              !formData.bankName ||
              !formData.accountNumber ||
              !formData.accountName
            }
          >
            {bankAccount ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng"}
          </button>
        </div>
        <button
          type="submit"
          onClick={handlePublish}
          className={`mt-4 w-full cursor-pointer rounded-lg p-3 font-semibold transition ${
            isBankAdded
              ? "bg-main hover:bg-main-bold text-white"
              : "!cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          disabled={!isBankAdded}
        >
          Publish sự kiện
        </button>
      </div>
    </div>
  );
};

export default BankAccountSetup;
