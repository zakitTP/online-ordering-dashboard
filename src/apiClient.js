import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔒 Global 401 handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized — redirecting to login...");
      // window.location.href = "/order/admin/login"; 
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
