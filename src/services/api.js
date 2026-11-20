
import axios from "axios";

const API = axios.create({
  baseURL: "https://farmer-backend-5doa.onrender.com/api",
});

export default API;
