// api.ts
import axios from 'axios';
import { message } from 'antd';

declare module 'axios' {
  interface AxiosRequestConfig {
    showSuccess?: boolean;
    suppressError?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // Replace with your actual API
  withCredentials: true, // Needed if using cookies
});

// === Request Interceptor ===
// Attach access token to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// === Response Interceptor ===
// Handles:
// 1. Showing success/error messages
// 2. Refreshing token on 401
// 3. Retrying original request
api.interceptors.response.use(
  async response => {
    const { data, config } = response;

    // Show success message if applicable
    if (data?.message && config?.showSuccess !== false && !data?.error_code) {
      message.success(data.message);
    }

    // Throw error manually if API returns 200 with error_code
    if (data?.error_code) {
      if (config?.suppressError !== true) {
        message.error(data.message || 'Something went wrong');
      }
      const error = new Error(data.message || 'Business logic error');
      (error as any).code = data.error_code;
      throw error;
    }

    return response;
  },
  async error => {
    const originalRequest = error.config;

    // === Refresh token flow ===
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          'https://your-api.com/auth/refresh',
          {
            refreshToken: localStorage.getItem('refreshToken'),
          },
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        message.error('Session expired. Please log in again.');
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show global error message
    const errorMsg = error?.response?.data?.message || error.message || 'Unexpected error';
    message.error(errorMsg);

    return Promise.reject(error);
  }
);

export default api;
