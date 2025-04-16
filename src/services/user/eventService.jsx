import axios from "../customize_axios";

export const getEventInfoById = async (eventId, token) => {
  try {
    // const response = await axios.get(`/event/${eventId}`, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // return response.data.data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      eventType: "RECURRING",
    };
  } catch (error) {
    console.error("getEventInfoById", error.response?.data || error.message);
    throw error;
  }
};
export const createEvent = async (data, token) => {
  console.log(token);
  try {
    const response = await axios.post("/event", data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("createEvent", error.response?.data || error.message);
    throw error;
  }
};
