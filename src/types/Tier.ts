export interface PricingTier {
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
