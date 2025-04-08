// src/api/auth/hooks.ts
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import api from '../utils/api';
import axios from 'axios';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const useLogin = (options?: UseMutationOptions<LoginResponse, Error, LoginPayload>) => {
  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const response = await api.post('/admin/auth/login', credentials);
      return response.data;
    },
    onSuccess: data => {
      localStorage.setItem('accessToken', data.accessToken);
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
      const refreshToken = localStorage.getItem('refreshToken');

      // Send POST request with refresh token in the body
      const response = await api.post('/admin/auth/logout', {
        refreshToken: refreshToken,
      });

      return response.data;
    },
    onSuccess: () => {
      // Clear tokens from localStorage after successful logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // You can add additional success callback here if needed
      options?.onSuccess?.(undefined, undefined, undefined);
    },
    onError: (error: any) => {
      // Log error and handle gracefully
      if (axios.isAxiosError(error) && error.response) {
        console.error('Logout error:', error.response.data);
      }

      // Still remove tokens even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Pass error to custom handler if provided
      options?.onError?.(error, undefined, undefined);
    },
    ...options,
  });
};

export const useChangePassword = (
  options?: UseMutationOptions<any, Error, ChangePasswordPayload>
) => {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordPayload) => {
      const response = await api.post('/admin/auth/change-password', passwordData);
      return { data: response.data, passwordData };
    },
    onSuccess: ({ data, passwordData }) => {
      // Call the provided success callback if it exists
      options?.onSuccess?.(data, passwordData, undefined);
    },
    onError: (error: any, passwordData) => {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Change password error:', error.response.data);
      }

      // Call the provided error callback if it exists
      options?.onError?.(error, passwordData, undefined);
    },
    ...options,
  });
};
