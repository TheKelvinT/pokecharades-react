import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Only include editable fields in the update payload
interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
}

export const useAdminProfile = () => {
  return useQuery<AdminProfile>({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const response = await api.get('/admin/profile/me', { showSuccess: false });
      return response.data.data; // Return just the data property
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<AdminProfile>, Error, UpdateProfilePayload>({
    mutationFn: async data => {
      const response = await api.put('/admin/profile/me', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the profile data
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    },
  });
};
