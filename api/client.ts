// api/client.ts

import axios from "axios";
import * as Utils from "@/lib/utils";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

// evita refresh multipli contemporanei
let isRefreshing = false;

let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(async config => {
  const token = await Utils.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config;

    // token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // avoid infinite loops
      originalRequest._retry = true;

      // refresh ongoing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization =
              `Bearer ${token}`;

            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await Utils.getRefreshToken();

        if (!refreshToken) {
          throw new Error("Refresh token mancante");
        }

        // call refresh
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_ROOT}/refresh`,
          {
            refreshToken,
          }
        );

        const newAccessToken = response.data.accessToken;

        // salva nuovo token
        await Utils.setAccessToken(newAccessToken);

        // aggiorna header globali
        apiClient.defaults.headers.common.Authorization =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // ripete request originale
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        // logout
        await Utils.deleteTokens();

        console.log("Sessione expired");

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);