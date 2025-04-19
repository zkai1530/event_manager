import axios from "../customize_axios";

export const createTicket = async (data, token) => {
  try {
    const response = await axios.post("/ticket", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("createTicket", error.response?.data || error.message);
    throw error;
  }
};

export const updateTicket = async (ticketId, data, token) => {
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
