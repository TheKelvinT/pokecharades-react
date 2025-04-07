// src/api/auth/hooks.ts
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import api from '../utils/http';
import axios from 'axios';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

export const useLogin = (options?: UseMutationOptions<LoginResponse, Error, LoginPayload>) => {
  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await api.post('/admin/auth/login', credentials);
      return response.data;
    },
    onSuccess: data => {
      localStorage.setItem('access_token', data.access_token);
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.message);
      }
    },
    ...options,
  });
};

export const useLogout = (options?: UseMutationOptions<any, Error, void>) => {
  return useMutation({
    mutationFn: async () => {
      const refresh_token = localStorage.getItem('refresh_token');

      // Send POST request with refresh token in the body
      const response = await api.post('/admin/auth/logout', {
        refresh_token: refresh_token,
      });

      return response.data;
    },
    onSuccess: () => {
      // Clear tokens from localStorage after successful logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // You can add additional success callback here if needed
      options?.onSuccess?.(undefined, undefined, undefined);
    },
    onError: (error: any) => {
      // Log error and handle gracefully
      if (axios.isAxiosError(error) && error.response) {
        console.error('Logout error:', error.response.data);
      }

      // Still remove tokens even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Pass error to custom handler if provided
      options?.onError?.(error, undefined, undefined);
    },
    ...options,
  });
};
