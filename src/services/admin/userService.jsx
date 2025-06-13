import axios from "../customize_axios";

export const getAllUsers = async (token, page) => {
  try {
    const response = await axios.get(`/user/all?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("getAllUsers", error.response?.data || error.message);
    throw error;
  }
};

export const searchUser = async (token, keyword, page) => {
  try {
    const response = await axios.get(
      `/user/search?keyword=${keyword}&&page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("searchUser", error.response?.data || error.message);
    throw error;
  }
};

export const blockUser = async (token, userId) => {
  console.log(token)
  console.log(userId)
  try {
    const response = await axios.patch(`user/block/${userId}`, {},{
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("blockUser", error.response?.data || error.message);
    throw error;
  }
};

export const unblockUser = async (token, userId) => {
  try {
    const response = await axios.patch(`user/unblock/${userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("unblockUser", error.response?.data || error.message);
    throw error;
  }
};
