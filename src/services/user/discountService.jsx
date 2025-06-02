import axios from "../customize_axios";

export const createDiscount = async (data, token) => {
  try {
    const response = await axios.post("/discount", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("createDiscount", error.response?.data || error.message);
    throw error;
  }
};

export const updateDiscount = async (discountId, data, token) => {
  console.log("thu", data);
  console.log("thu1", discountId);
  try {
    const response = await axios.put(`/discount/${discountId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("updateDiscount", error.response?.data || error.message);
    throw error;
  }
};

export const deleteDiscount = async (discountId, token) => {
  try {
    const response = await axios.delete(`/discount/${discountId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("deleteDiscount", error.response?.data || error.message);
    throw error;
  }
};
