import axios from "../customize_axios";

export const getEventInfoById = async (eventId) => {
  try {
    const response = await axios.get(`/event/${eventId}`);
    return response.data.data;
  } catch (error) {
    console.error("getEventInfoById", error.response?.data || error.message);
    throw error;
  }
};
export const createEvent = async (formData, token) => {
  console.log(token);
  try {
    const response = await axios.post("/event", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("createEvent", error.response?.data || error.message);
    throw error;
  }
};

export const updateEvent = async (eventId, formData, token) => {
  console.log(token);
  try {
    const response = await axios.put(`/event/${eventId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("updateEvent", error.response?.data || error.message);
    throw error;
  }
};

export const getEventListInfoByUser = async (token, page, timeFilter) => {
  try {
    const response = await axios.get(
      `/event?timeFilter=${timeFilter}&page=${page}`,
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
      "getEventListInfoByUser",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const publishEvent = async (eventId, token) => {
  console.log(token);
  try {
    const response = await axios.post(`/event/publish/${eventId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("publishEvent", error.response?.data || error.message);
    throw error;
  }
};

export const unpublishEvent = async (eventId, token) => {
  console.log(token);
  try {
    const response = await axios.post(`/event/unpublish/${eventId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("unpublishEvent", error.response?.data || error.message);
    throw error;
  }
};

export const searchEvents = async (
  keyword,
  location,
  isFree,
  startDate,
  endDate,
  eventStatus,
  page,
) => {
  try {
    const params = {
      page,
      location,
      isFree,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      eventStatus: eventStatus || undefined,
    };
    const response = await axios.get(`/event/search/${keyword || ""}/result`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("searchEvents", error.response?.data || error.message);
    throw error;
  }
};

export const getEventProgress = async (eventId, token) => {
  console.log("e", eventId);
  try {
    const response = await axios.get(`/event/event-status/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("getEventProgress", error.response?.data || error.message);
    throw error;
  }
};

export const getCateAndTheme = async (token) => {
  try {
    const response = await axios.get(`/event/category-theme`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("getCateAndTheme", error.response?.data || error.message);
    throw error;
  }
};

export const addCateAndTheme = async (eventId, cateId, themeId, token) => {
  console.log(token);
  try {
    const response = await axios.post(`/event/category-theme/${eventId}/${cateId}/${themeId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("addCateAndTheme", error.response?.data || error.message);
    throw error;
  }
};
