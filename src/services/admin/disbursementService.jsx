import axios from "../customize_axios";
export const getEligibleDisbursementEvents = async (token, page) => {
  try {
    const response = await axios.get(
      `/disbursement/events/eligible-disbursement?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data
  } catch (error) {
    console.error(
      "getEligibleDisbursementEvents",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getUndisbursementSchedulesOfEvent = async (eventId, token) => {
  try {
    const response = await axios.get(`/disbursement/events/${eventId}/schedules`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      "getEligibleDisbursementEvents",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const disbursed = async (data, token) => {
  try {
    const response = await axios.post(`/disbursement/confirm`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("disbursed", error.response?.data || error.message);
    throw error;
  }
};
