import axios from 'axios';

const API_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const refreshToken = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
  } catch (e) {
    console.error("Ошибка обновления токена: ", e);
    throw e;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Не удалось обновить токен", refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);