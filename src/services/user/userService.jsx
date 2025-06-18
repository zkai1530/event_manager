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

export const loginNormal = async (email, password) => {
  try {
    const response = await axios.post(
      "/auth/login",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("loginNormal ", error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async (token) => {
  try {
    const response = await axios.post("/auth/logout", { token });
    return response.data;
  } catch (error) {
    console.error("logout ", error.response?.data || error.message);
    throw error;
  }
};

export const introspect = async (token) => {
  try {
    const response = await axios.post(
      "/auth/introspect",
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Introspect failed", error.response?.data || error.message);
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

export const updateUserInfo = async (token, data) => {
  try {
    const response = await axios.put("/user/me", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("updateUserInfo", error);
    throw error;
  }
};

export const followUser = async (userId, token) => {
  console.log(token);
  try {
    const response = await axios.post(`/follow/${userId}`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("followUser", error.response?.data || error.message);
    throw error;
  }
};

export const unfollowUser = async (userId, token) => {
  console.log(token);
  try {
    const response = await axios.delete(`/follow/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("unfollowUser", error.response?.data || error.message);
    throw error;
  }
};

export const isFollowUser = async (userId, token) => {
  try {
    const response = await axios.get(`/follow/is-following/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("isFollowUser ", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("isFollowUser ", error.response?.data || error.message);
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
    console.log(response.data.data);
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
