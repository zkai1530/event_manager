import axios from "axios";

const instance = axios.create({
  // baseURL: 'http://localhost:8081',
  baseURL: "https://event-manager-5elo.onrender.com",
});

export default instance;
