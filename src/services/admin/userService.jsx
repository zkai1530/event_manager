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
