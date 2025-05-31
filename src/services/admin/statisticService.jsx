import axios from "../customize_axios";

export const getComplaintCountByReason = async (token) => {
  try {
    const response = await axios.get(
      `/admin/statistic/complaint-count-by-reason`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    // return response.data.data;
    return {
      data: {
        "Thông tin sự kiện sai lệch": 10,
        "Lý do khác": 30,
        "Không được check-in dù đã mua vé": 20,
        "Sự kiện không diễn ra": 15,
        "Sự kiện có dấu hiệu lừa đảo": 21,
      },
    };
  } catch (error) {
    console.error(
      "getComplaintCountByReason ",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getCanceledOrderRateByMonth = async (token, year) => {
  try {
    const response = await axios.get(
      `/admin/statistic/canceled-order-rate?year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "getCanceledOrderRateByMonth ",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getOrderStatusCount = async (token, year, month) => {
  try {
    const response = await axios.get(
      `/admin/statistic/order-status-count?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "getOrderStatusCount ",
      error.response?.data || error.message,
    );
    throw error;
  }
};
