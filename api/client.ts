// api/client.ts

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as Utils from '@/lib/utils';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async config => {
  const token = await Utils.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.log("Utente non autenticato");

      // logout automatico
    }

    return Promise.reject(error);
  }
);
