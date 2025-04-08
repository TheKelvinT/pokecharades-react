import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export const useAdminProfile = () => {
  return useQuery<ApiResponse<AdminProfile>>({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const response = await api.get('/admin/profile/me');
      return response.data;
    },
  });
};
