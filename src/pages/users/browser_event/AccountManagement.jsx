import { useState } from "react";
import { FaUserCircle, FaEdit, FaSave } from "react-icons/fa";

const AccountInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Nguyen Van A",
    email: "nguyenvana@example.com",
    phone_number: "0901234567",
    location: "Ho Chi Minh City",
    current_mode: "light",
    avatar_url:
      "https://yt3.ggpht.com/ytc/AIdro_m4jJbEjL0SIaIOtfApQMcEAEbnC-hAy2naWEzpzZ-wcWvyVBEhmP2ZNn6PyBDPQpvKQA=s88-c-k-c0x00ffffff-no-rj",
  });
  const [tempData, setTempData] = useState({ ...formData });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData({ ...tempData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const avatarUrl = URL.createObjectURL(file);
      setTempData({ ...tempData, avatar_url: avatarUrl });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...formData });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!tempData.name || !tempData.email) {
      setError("Tên và email không được để trống.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempData.email)) {
      setError("Email không hợp lệ.");
      return;
    }
    setError("");
    setFormData({ ...tempData });
    setIsEditing(false);
    console.log("Thông tin tài khoản đã cập nhật:", {
      user_id: 1, // Giả định, thay bằng giá trị thực từ auth
      name: tempData.name,
      email: tempData.email,
      phone_number: tempData.phone_number,
      location: tempData.location,
      current_mode: tempData.current_mode,
      avatar_url: tempData.avatar_url,
      updated_at: new Date().toISOString(),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData({ ...formData });
    setError("");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-center">
          <FaUserCircle className="mr-3 text-4xl text-blue-500" />
          <h2 className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-5xl font-extrabold text-transparent">
            Thông tin tài khoản
          </h2>
        </div>
        <div className="mb-10 flex justify-center">
          <div className="group relative">
            <img
              src={formData.avatar_url}
              alt="Avatar"
              className="h-36 w-36 rounded-full border-4 border-blue-100 object-cover transition-transform duration-300 group-hover:scale-105 md:h-48 md:w-48"
            />
            {isEditing && (
              <label className="bg-opacity-50 group-hover:bg-opacity-60 absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black transition-opacity duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <span className="font-medium text-white">Tải ảnh</span>
              </label>
            )}
          </div>
        </div>
        {error && (
          <p className="mb-8 text-center font-medium text-red-500">{error}</p>
        )}
        {!isEditing ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label className="block font-medium text-gray-600">
                  Họ và tên
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.name}
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
                  Số điện thoại
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.phone_number || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Vị trí
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.location || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="block font-medium text-gray-600">
                  Chế độ giao diện
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {formData.current_mode || "Chưa chọn"}
                </p>
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 from-10% to-purple-500 to-90% p-4 font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-600"
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
                <label className="mb-2 block font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={tempData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={tempData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={tempData.phone_number}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Vị trí
                </label>
                <input
                  type="text"
                  name="location"
                  value={tempData.location}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nhập vị trí"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  Chế độ giao diện
                </label>
                <select
                  name="current_mode"
                  value={tempData.current_mode}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-300 p-4 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="light">Sáng</option>
                  <option value="dark">Tối</option>
                </select>
              </div>
            </div>
            <div className="mx-auto flex max-w-md space-x-4">
              <button
                type="submit"
                className="relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 from-10% to-purple-500 to-90% p-4 font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-600"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <FaSave className="mr-2" /> Lưu
                </span>
                <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 hover:opacity-20"></div>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-gray-200 p-4 font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-300"
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
