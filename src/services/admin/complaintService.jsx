import axios from "../customize_axios";

export const getAllComplaints = async (token, page) => {
  try {
    const response = await axios.get(`/complaint/all?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("getAllComplaints ", error.response?.data || error.message);
    throw error;
  }
};
