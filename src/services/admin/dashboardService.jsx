import axios from "../customize_axios";

export const getDashboardOverview = async (token) => {
  try {
    const response = await axios.get(`/admin/statistic/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      "getDashboardOverview ",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getRevenueByMonth = async (token, year) => {
  try {
    const response = await axios.get(
      `/admin/statistic/dashboard/revenue-by-month?year=${year}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getRevenueByMonth ", error.response?.data || error.message);
    throw error;
  }
};

export const getTop5EventsByRevenue = async (token, startDate, endDate) => {
  try {
    const response = await axios.get(
      `/admin/statistic/dashboard/top-events?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "getTop5EventsByRevenue ",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getEventsByMonth = async (token, year) => {
  try {
    const response = await axios.get(
      `/admin/statistic/dashboard/event-counts-by-month?year=${year}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getEventsByMonth ", error.response?.data || error.message);
    throw error;
  }
};

export const getRecentOrders = async (token) => {
  try {
    const response = await axios.get(
      `/admin/statistic/dashboard/recent-orders`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("getRecentOrders ", error.response?.data || error.message);
    throw error;
  }
};
