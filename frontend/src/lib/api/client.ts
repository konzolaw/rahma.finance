import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api/v1';

/**
 * Shared Axios instance with security interceptors
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for httpOnly cookies (refresh token)
});

// Request Interceptor: Attach Access Token (In-Memory Only)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Flag to track if we are currently refreshing the token
let isRefreshing = false;
// Queue to hold requests that failed with 401 while refreshing
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor: Handle 401 Unauthorized (Token Expiration)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (process.env.NODE_ENV === 'development') {
      const status = error.response?.status;
      const url = error.config?.url;
      const data = error.response?.data || error.message;

      // Silence or downgrade logs for common/expected status codes
      if (status === 401 || status === 400) {
        console.warn(`[API ${status}] ${url}`, data);
      } else {
        console.error(`[API Error] ${status} ${url}`, data);
      }
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {},
          { withCredentials: true }
        );

        const accessToken = response.data.data.access_token;
        
        // Update the store with the new access token
        useAuthStore.getState().setAccessToken(accessToken);

        // Update the original request header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
