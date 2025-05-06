import axios from "../customize_axios";

export const getFavoriteEvents = async (page, token) => {
  try {
    const response = await axios.get(`/favorite?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("getFavoriteEvents", error.response?.data || error.message);
    throw error;
  }
};

export const addFavorite = async (eventId, token) => {
  console.log(token);
  try {
    const response = await axios.post(`/favorite/${eventId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("addFavorite", error.response?.data || error.message);
    throw error;
  }
};

export const removeFavorite = async (eventId, token) => {
  console.log(token);
  try {
    const response = await axios.delete(`/favorite/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("removeFavorite", error.response?.data || error.message);
    throw error;
  }
};

export const checkExistingEvent = async (eventId, token) => {
  try {
    const response = await axios.get(`/favorite/is-existing/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("checkExistingEvent", error.response?.data || error.message);
    throw error;
  }
};
