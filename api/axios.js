import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/public",
});

export default axiosInstance; 