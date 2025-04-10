import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface TierQueryParams {
  tierType?: 'MONTHLY' | 'YEARLY';
  isActive?: boolean;
  isRecommended?: boolean;
  search?: string;
  take?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

interface PricingTier {
  id: string;
  name: string;
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  originalPrice: number;
  discountAmount: number;
  isRecommended: boolean;
  isActive: boolean;
  position: number;
  tierType: 'MONTHLY' | 'YEARLY';
  summary: string;
  benefits: string[];
  monthlyEntries: number;
  createdAt: string;
  updatedAt: string;
}

interface TierResponse {
  data: PricingTier[];
  meta: {
    total: number;
    taken: number;
    remaining: number;
  };
}

interface ApiResponse<T> {
  data: T;
}

interface CreateTierPayload {
  name: string;
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  originalPrice: number;
  discountAmount: number;
  tierType: 'MONTHLY' | 'YEARLY';
  summary: string;
  benefits: string[];
  monthlyEntries: number;
}

interface UpdateTierPayload {
  name: string;
  discountType: 'PERCENT' | 'WHOLE_NUMBER';
  originalPrice: number;
  discountAmount: number;
  tierType: 'MONTHLY' | 'YEARLY';
  summary: string;
  benefits: string[];
  monthlyEntries: number;
  isRecommended: boolean;
  isActive?: boolean;
}

interface ActiveTiersResponse {
  data: PricingTier[];
}

interface ReorderTiersPayload {
  firstTierId: string;
  secondTierId: string;
  tierType: 'MONTHLY' | 'YEARLY';
}

export const useTiers = (params: TierQueryParams = {}) => {
  return useQuery<ApiResponse<TierResponse>>({
    queryKey: ['tiers', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).map(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      const response = await api.get(`/admin/tiers?${searchParams.toString()}`, {
        showSuccess: false,
      });

      return response.data;
    },
    enabled: Boolean(params.tierType && params.take && params.skip !== undefined && params.order),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useActiveTiers = (params: { tierType: 'MONTHLY' | 'YEARLY' }) => {
  return useQuery<ApiResponse<ActiveTiersResponse>>({
    queryKey: ['activeTiers', params.tierType],
    queryFn: async () => {
      const response = await api.get(`/admin/tiers/active?tierType=${params.tierType}`, {
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

export const useCreateTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTierPayload) => {
      const response = await api.post('/admin/tier', payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tiers', { tierType: variables.tierType }],
      });
      queryClient.invalidateQueries({
        queryKey: ['activeTiers', variables.tierType],
      });
    },
  });
};

export const useUpdateTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTierPayload }) => {
      const response = await api.put(`/admin/tier/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tiers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['activeTiers'],
      });
    },
  });
};

export const useDeactivateTierStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(
        `/admin/tier/${id}/deactivate`,
        {},
        {
          showSuccess: false,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      queryClient.invalidateQueries({ queryKey: ['activeTiers'] });
    },
  });
};

export const useSetRecommended = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(
        `/admin/tier/${id}/set-recommended`,
        {},
        {
          showSuccess: false,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      queryClient.invalidateQueries({ queryKey: ['activeTiers'] });
    },
  });
};

export const useReorderTiers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReorderTiersPayload) => {
      const response = await api.put('/admin/tiers/switch', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTiers'] });
    },
  });
};

export const useDeleteTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/tier/${id}`, {
        showSuccess: false,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      queryClient.invalidateQueries({ queryKey: ['activeTiers'] });
    },
  });
};

// Example usage:
// const { data, isLoading, error } = useTiers({
//   tierType: 'MONTHLY',
//   isActive: true,
//   isRecommended: true,
//   search: 'premium',
//   take: 10,
//   skip: 0,
//   sortBy: 'name',
//   order: 'asc'
// });

// Example usage:
// const { mutate: createTier, isPending } = useCreateTier();
// createTier({
//   name: "Basic",
//   discountType: "PERCENT",
//   originalPrice: 39.99,
//   discountAmount: 20,
//   tierType: "YEARLY",
//   summary: "Basic tier with 20% discount",
//   benefits: ["Unlimited access", "Priority support", "Custom branding"],
//   monthlyEntries: 50
// });
