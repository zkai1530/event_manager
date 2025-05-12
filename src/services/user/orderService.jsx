import axios from "../customize_axios";

export const createOrder = async (data, token) => {
  try {
    const response = await axios.post("/order/create-order", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("createOrder", error.response?.data || error.message);
    throw error;
  }
};

export const updateStatusOrder = async (orderId, token) => {
  console.log(token);
  try {
    const response = await axios.put(`/order/cancel/${orderId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("updateStatusOrder", error.response?.data || error.message);
    throw error;
  }
};

export const checkin = async (qrCode, token) => {
  try {
    const response = await axios.post(
      "/order/check-in",
      { qrCode },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("checkin", error.response?.data || error.message);
    throw error;
  }
};

export const getMyTicketsByOrderStatus = async (
  status,
  timeFilter,
  page,
  token,
) => {
  try {
    const response = await axios.get(
      `/order/my-tickets?status=${status}&timeFilter=${timeFilter}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(
      "getMyTicketsByOrderStatus",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const fetchTicketSales = async (scheduleId, token) => {
  try {
    const response = await axios.get(`/order/by-schedule/${scheduleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("fetchTicketSales", error.response?.data || error.message);
    throw error;
  }
};

export const reportOrder = async (orderId, reasonId, token) => {
  console.log(orderId, reasonId, token)
  try {
    const response = await axios.post(
      "/complaint",
      {
        orderId,
        reasonId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("reportOrder", error.response?.data || error.message);
    throw error;
  }
};