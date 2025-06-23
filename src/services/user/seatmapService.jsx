import axios from "../customize_axios";

export const createSeatMap = async (data, token) => {
  try {
    const response = await axios.post(`/venue-map`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "createSeatMap error:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error.message;
  }
};

export const getVenueMap = async (venue_map_id, token) => {
  try {
    const response = await axios.get(`/venue-map/${venue_map_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("getVenueMap", error.response?.data || error.message);
    throw error;
  }
};
