
import { useState, useEffect } from "react";
import { FaUserCircle, FaEdit, FaSave } from "react-icons/fa";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import { getUserInfo, updateUserInfo } from "@/services/user/userService"; // Giả định đường dẫn
import Loading from "@/components/ui/Loading";

const AccountInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    name: "",
    phoneNumber: "",
    location: "",
    accountNumber: "",
    accountName: "",
    bankName: "",
    bankShortName: "",
    avatarUrl: "",
  });
  const [tempData, setTempData] = useState({ ...formData });
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch danh sách ngân hàng từ VietQR
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://api.vietqr.io/v2/banks");
        if (response.data.code === "00") {
          setBanks(response.data.data);
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

  // Fetch thông tin người dùng
  const fetchUserData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const userData = await getUserInfo(token);
      setFormData(userData);
      setTempData(userData);

      if (userData.bankShortName) {
        const matchedBank = banks.find(
          (bank) => bank.shortName === userData.bankShortName
        );
        if (matchedBank) {
          setSelectedBank({
            value: matchedBank.name,
            label: `${matchedBank.name} (${matchedBank.shortName})`,
            logo: matchedBank.logo,
            shortName: matchedBank.shortName,
          });
        }
      }
    } catch (err) {
      setError("Lỗi khi tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token, banks]);

  // Xử lý chọn ngân hàng
  const handleBankChange = (selectedOption) => {
    setSelectedBank(selectedOption);
    const selectedBankData = banks.find(
      (bank) => bank.name === selectedOption?.value
    );
    setTempData({
      ...tempData,
      bankName: selectedOption?.value || "",
      bankShortName: selectedBankData ? selectedBankData.shortName : "",
    });
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData({ ...tempData, [name]: value });
    setError("");
  };

  // Validate form
  const validate = () => {
    const errors = {};
    if (!tempData.name || tempData.name.trim() === "") {
      errors.name = "Tên không được để trống.";
    }
    if (tempData.phoneNumber && !tempData.phoneNumber.match(/^0[0-9]{9}$/)) {
      errors.phoneNumber = "Số điện thoại phải là 10 số, bắt đầu bằng 0.";
    }
    if (
      (tempData.accountNumber ||
        tempData.accountName ||
        tempData.bankName ||
        tempData.bankShortName) &&
      (!tempData.accountNumber ||
        !tempData.accountName ||
        !tempData.bankName ||
        !tempData.bankShortName)
    ) {
      errors.bank = "Vui lòng điền đầy đủ thông tin ngân hàng.";
    }
    setError(Object.values(errors).join(" "));
    return Object.keys(errors).length === 0;
  };

  // Xử lý lưu thông tin
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await updateUserInfo(token, tempData);
      await fetchUserData(); // Gọi lại getUserInfo để lấy dữ liệu mới
      setIsEditing(false);
      Swal.fire({
        title: "Cập nhật thành công!",
        text: "Thông tin tài khoản đã được cập nhật.",
        icon: "success",
      });
    } catch (err) {
      setError("Cập nhật thất bại, vui lòng thử lại.");
      Swal.fire({
        title: "Lỗi!",
        text: "Cập nhật thông tin thất bại.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý hủy chỉnh sửa
  const handleCancel = () => {
    setIsEditing(false);
    setTempData({ ...formData });
    setSelectedBank(
      formData.bankShortName
        ? {
            value: formData.bankName,
            label: `${formData.bankName} (${formData.bankShortName})`,
            logo: banks.find((bank) => bank.shortName === formData.bankShortName)
              ?.logo,
            shortName: formData.bankShortName,
          }
        : null
    );
    setError("");
  };

  // Tạo options cho Select ngân hàng
  const bankOptions = banks.map((bank) => ({
    value: bank.name,
    label: `${bank.name} (${bank.shortName})`,
    shortName: bank.shortName,
    logo: bank.logo,
  }));

  return (
    <div className="min-h-screen bg-white px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div className="group h-32 w-32 overflow-hidden rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 p-1">
              <img
                src={formData.avatarUrl || "https://via.placeholder.com/128"}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="flex items-center">
            <FaUserCircle className="mr-3 text-4xl text-blue-500" />
            <h2 className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-5xl font-extrabold text-transparent">
              Thông tin tài khoản
            </h2>
          </div>
        </div>
        {error && (
          <p className="mb-8 text-center font-medium text-red-500">{error}</p>
        )}
        {loading && (
          <p className="mb-8 text-center text-gray-500">
            <Loading isLoading={loading} />
          </p>
        )}
        {!isEditing ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className="block font-medium text-gray-600">
                  ID người dùng
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.userId}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">Email</label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.email}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Họ và tên
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.name}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Số điện thoại
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.phoneNumber || "Chưa cập nhật"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-gray-600">
                  Vị trí
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.location || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Ngân hàng
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.bankName || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Mã ngân hàng
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.bankShortName || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Số tài khoản
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.accountNumber || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Tên tài khoản
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.accountName || "Chưa cập nhật"}
                </p>
              </div>
              {formData.bankName && selectedBank?.logo && (
                <div className="flex justify-center md:col-span-2">
                  <img
                    src={selectedBank.logo}
                    alt="Bank Logo"
                    className="h-14 w-auto rounded-md object-contain shadow-sm"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 p-4 font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-600"
            >
              <span className="relative z-10 flex items-center justify-center">
                <FaEdit className="mr-2" /> Chỉnh sửa thông tin
              </span>
              <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-20"></div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className="block font-medium text-gray-600">
                  ID người dùng
                </label>
                <input
                  type="text"
                  name="userId"
                  value={tempData.userId}
                  readOnly
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 p-4 text-gray-600"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={tempData.email}
                  readOnly
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 p-4 text-gray-600"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={tempData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={tempData.phoneNumber || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-gray-700">
                  Vị trí
                </label>
                <input
                  type="text"
                  name="location"
                  value={tempData.location || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập vị trí"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Ngân hàng
                </label>
                <Select
                  options={bankOptions}
                  onChange={handleBankChange}
                  value={selectedBank}
                  placeholder="Chọn ngân hàng"
                  isClearable
                  isDisabled={loading}
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
                <label className="mb-2 block font-medium text-gray-700">
                  Mã ngân hàng
                </label>
                <input
                  type="text"
                  name="bankShortName"
                  value={tempData.bankShortName}
                  readOnly
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 p-4 text-gray-600"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={tempData.accountNumber || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                  value={tempData.accountName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên tài khoản"
                />
              </div>
              {selectedBank?.logo && (
                <div className="flex justify-center md:col-span-2">
                  <img
                    src={selectedBank.logo}
                    alt="Bank Logo"
                    className="h-14 w-auto rounded-md object-contain shadow-sm"
                  />
                </div>
              )}
            </div>
            <div className="mx-auto flex max-w-md space-x-4">
              <button
                type="submit"
                className="relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 p-4 font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-600 disabled:opacity-50"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <FaSave className="mr-2" /> Lưu
                </span>
                <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-20"></div>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-gray-200 p-4 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-300 disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountInfo;
