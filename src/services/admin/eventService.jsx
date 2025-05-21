import axios from "../customize_axios";

export const getEventSummary = async (token) => {
  try {
    const response = await axios.get(`/event/admin/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("getEventSummary ", error.response?.data || error.message);
    throw error;
  }
};

export const getEvents = async (token, status, sort, page) => {
  try {
    let url = `/event/admin/filtered?page=${page}`;

    if (status && status.trim() !== "") {
      url += `&status=${encodeURIComponent(status)}`;
    }

    if (sort && sort.trim() !== "") {
      url += `&sort=${encodeURIComponent(sort)}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  } catch (error) {
    console.error("getEvents", error.response?.data || error.message);
    throw error;
  }
}

export const countEventsByTheme = async (token) => {
  try {
    const response = await axios.get(`/event/admin/event-theme-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("countEventsByTheme ", error.response?.data || error.message);
    throw error;
  }
};
