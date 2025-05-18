import axios from "../customize_axios";

export const getEventSummary = async (token) => {
  try {
    const response = await axios.get(`/event/admin/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("getEventSummary", error.response?.data || error.message);
    throw error;
  }
};
