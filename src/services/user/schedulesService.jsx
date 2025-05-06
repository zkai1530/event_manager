import axios from "../customize_axios";

export const createSchedules = async (eventId, data, token) => {
  try {
    const response = await axios.post(`/schedules/event/${eventId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("createSchedules", error.response?.data || error.message);
    throw error.response?.data;
  }
};

export const updateSchedules = async (ticketId, data, token) => {
  try {
    const response = await axios.put(`/ticket/${ticketId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("updateTicket", error.response?.data || error.message);
    throw error;
  }
};
