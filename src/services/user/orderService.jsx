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

export const reserveOrder = async (data, token) => {
  try {
    const response = await axios.post("/order/reserve", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("reserveOrder", error.response?.data || error.message);
    throw error;
  }
};

export const createPaymentLink = async (orderId, token) => {
  try {
    const response = await axios.post(`/order/payment-link/${orderId}`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("createPaymentLink", error.response?.data || error.message);
    throw error;
  }
};

export const getOrderStatus = async (orderId, token) => {
  try {
    const response = await axios.get(`/order/status/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("getOrderStatus", error.response?.data || error.message);
    throw error;
  }
};

export const cancelOrder = async (orderId, token) => {
  try {
    const response = await axios.put(`/order/cancel/${orderId}`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("cancelOrder", error.response?.data || error.message);
    throw error;
  }
};

export const getOrderByOrderId = async (orderId, token) => {
  try {
    const response = await axios.get(`/order/details/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("getOrderByOrderId", error.response?.data || error.message);
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
    return response.data;
  } catch (error) {
    console.error("checkin ", error.response?.data || error.message);
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

export const fetchTicketSales = async (scheduleId, token, page) => {
  try {
    const response = await axios.get(
      `/order/by-schedule/${scheduleId}?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("fetchTicketSales", error.response?.data || error.message);
    throw error;
  }
};

export const reportOrder = async (orderId, reasonId, token) => {
  console.log(orderId, reasonId, token);
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

export const getSuccessOrderDetails = async (orderId, token) => {
  try {
    const response = await axios.get(`/order/success-order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      "getSuccessOrderDetails ",
      error.response?.data || error.message,
    );
    throw error;
  }
};
