import axios from "../customize_axios";

export const getAllNotiByUser = async (token) => {
  try {
    const response = await axios.get(`/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("getAllNotiByUser", error.response?.data || error.message);
    throw error;
  }
};

export const readNoti = async (notiId, token) => {
  console.log(token);
  try {
    const response = await axios.put(`/notifications/${notiId}/read`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("readNoti", error.response?.data || error.message);
    throw error;
  }
};

export const deleteNoti = async (notiId, token) => {
  console.log(token);
  try {
    const response = await axios.delete(`/notifications/${notiId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("deleteNoti", error.response?.data || error.message);
    throw error;
  }
};
