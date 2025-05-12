import axios from "../customize_axios";

export const getDashboardOverview = async (token) => {
  try {
    const response = await axios.get(
      `/organizer/statistic/dashboard/overview`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "getDashboardOverview",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getTopTicketsSold = async (token) => {
  try {
    const response = await axios.get(
      `/organizer/statistic/dashboard/top-tickets-sold`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getTopTicketsSold", error.response?.data || error.message);
    throw error;
  }
};

export const getTicketPaymentStatus = async (token) => {
  try {
    const response = await axios.get(
      `/organizer/statistic/dashboard/ticket-payment-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getTopTicketsSold", error.response?.data || error.message);
    throw error;
  }
};

export const getRevenueByWeek = async (token, year, month) => {
  try {
    const response = await axios.get(
      `/organizer/statistic/dashboard/revenue-by-week?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getRevenueByWeek", error.response?.data || error.message);
    throw error;
  }
};

export const getAttendanceStatus = async (token) => {
  try {
    const response = await axios.get(
      `/organizer/statistic/dashboard/attendance-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getAttendanceStatus", error.response?.data || error.message);
    throw error;
  }
};

export const getComplaintsByReason = async (token) => {
  try {
    const response = await axios.get(
      `/organizer/statistic/dashboard/complaints-by-reason`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "getComplaintsByReason",
      error.response?.data || error.message,
    );
    throw error;
  }
};
