import axios from "../customize_axios";

export const loginWithGoogleCode = async (code) => {
  try {
    const response = await axios.post("/auth/google", null, {
      params: { code }, // Gửi code qua query parameter
    });
    console.log(response.data.data);
    return response.data.data; // Lấy token từ response.data.data
  } catch (error) {
    console.error("loginWithGoogleCode", error);
    throw error;
  }
};

export const getUserInfo = async (token) => {
  try {
    const response = await axios.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data
  } catch (error) {
    console.error("getUserInfo", error);
    throw error;
  }
};
