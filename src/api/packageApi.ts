import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface PackageQueryParams {
  isActive?: boolean;
  search?: string;
  take?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

interface Package {
  id: string;
  name: string;
  price: number;
  discount: number;
  isActive: boolean;
  position?: number;
  giveawayEntries: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

interface PackageResponse {
  data: Package[];
  meta: {
    total: number;
    taken: number;
    remaining: number;
  };
}

interface ApiResponse<T> {
  data: T;
}

interface CreatePackagePayload {
  name: string;
  price: number;
  discount: number;
  giveawayEntries: number;
  summary?: string;
}

interface UpdatePackagePayload extends CreatePackagePayload {
  isActive?: boolean;
  position?: number;
}

interface ActivePackagesResponse {
  data: Package[];
}

// GET /admin/package - Get all packages with pagination and filters
export const usePackages = (params: PackageQueryParams = {}) => {
  return useQuery<ApiResponse<PackageResponse>>({
    queryKey: ['packages', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).map(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      const response = await api.get(`/admin/package?${searchParams.toString()}`, {
        showSuccess: false,
      });

      return response.data;
    },
    enabled: Boolean(params.take && params.skip !== undefined && params.order),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// GET /admin/package/active - Get active packages
export const useActivePackages = () => {
  return useQuery<ApiResponse<ActivePackagesResponse>>({
    queryKey: ['activePackages'],
    queryFn: async () => {
      const response = await api.get('/admin/package/active', {
        showSuccess: false,
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// POST /admin/package - Create a new package
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePackagePayload) => {
      const response = await api.post('/admin/package', payload, {
        showSuccess: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['packages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['activePackages'],
      });
    },
  });
};

// PUT /admin/package/:id - Update a package
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePackagePayload }) => {
      const response = await api.put(`/admin/package/${id}`, payload, {
        showSuccess: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['packages'],
      });
      queryClient.invalidateQueries({
        queryKey: ['activePackages'],
      });
    },
  });
};

// PUT /admin/package/:id/deactivate - Deactivate a package
export const useDeactivatePackageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(
        `/admin/package/${id}/deactivate`,
        {},
        {
          showSuccess: false,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['activePackages'] });
    },
  });
};

// DELETE /admin/package/:id - Delete a package
export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/package/${id}`, {
        showSuccess: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['activePackages'] });
    },
  });
};

// PUT /admin/package/switch - Reorder packages
export const useReorderPackages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { firstPackageId: string; secondPackageId: string }) => {
      const response = await api.put('/admin/package/switch-positions', payload, {
        showSuccess: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activePackages'] });
    },
  });
};

// Add this hook to your packageApi.ts file
export const useSetRecommended = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) =>
      api.put(`/admin/package/${packageId}/recommend`, {
        showSuccess: false,
      }),
    onSuccess: () => {
      // Invalidate both active packages and all packages queries
      queryClient.invalidateQueries({ queryKey: ['activePackages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};
