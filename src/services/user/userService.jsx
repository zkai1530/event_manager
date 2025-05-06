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
    return response.data.data;
  } catch (error) {
    console.error("getUserInfo", error);
    throw error;
  }
};

export const getMyBankAccount = async (token) => {
  try {
    const response = await axios.get("/bank-account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("getMyBankAccount", error);
    throw error;
  }
};

export const addBankAccount = async (data, token) => {
  console.log(token);
  try {
    const response = await axios.post("/bank-account", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("addBankAccount", error.response?.data || error.message);
    throw error;
  }
};

export const updateBankAccount = async (data, token) => {
  console.log(token);
  try {
    const response = await axios.put(`/bank-account`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("updateBankAccount", error.response?.data || error.message);
    throw error;
  }
};

export const removeBankAccount = async (bankId, token) => {
  console.log(token);
  try {
    const response = await axios.delete(`/favorite/${bankId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("removeBankAccount", error.response?.data || error.message);
    throw error;
  }
};
