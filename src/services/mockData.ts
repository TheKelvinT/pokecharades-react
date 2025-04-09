// Mock data for the application

// Dashboard
export const quickActions = [
  { id: 1, title: 'Create Member', icon: 'user-add', path: '/members/create' },
  { id: 2, title: 'Create Partner', icon: 'team', path: '/partners/create' },
  { id: 3, title: 'New Event', icon: 'calendar', path: '/events/create' },
  { id: 4, title: 'New Package', icon: 'gift', path: '/packages/create' },
];

export const summaryNumbers = [
  { id: 1, title: 'Total Members', value: 12456, change: 12.5, icon: 'user' },
  { id: 2, title: 'Active Subscriptions', value: 8932, change: 8.2, icon: 'dollar' },
  { id: 3, title: 'Partners', value: 72, change: 5.6, icon: 'team' },
  { id: 4, title: 'Events This Month', value: 18, change: -2.3, icon: 'calendar' },
];

// Tiers
export const tiersList = [
  {
    id: '0f58baca-3d6f-4e06-b0f0-58eca6d1a561',
    name: 'Basic',
    discountType: 'PERCENT',
    originalPrice: 99.99,
    discountAmount: 20,
    isRecommended: false,
    isActive: true,
    position: 0,
    tierType: 'MONTHLY',
    summary: 'Basic tier with 20% discount',
    benefits: ['Unlimited access', 'Priority support', 'Custom branding'],
    monthlyEntries: 50,
    createdAt: '2024-04-09T08:11:28.356Z',
    updatedAt: '2024-04-09T08:11:28.356Z',
  },
  {
    id: '1f58baca-3d6f-4e06-b0f0-58eca6d1a562',
    name: 'Professional',
    discountType: 'PERCENT',
    originalPrice: 199.99,
    discountAmount: 15,
    isRecommended: true,
    isActive: true,
    position: 1,
    tierType: 'MONTHLY',
    summary: 'Professional tier with advanced features',
    benefits: ['Everything in Basic', 'Advanced analytics', '24/7 support', 'API access'],
    monthlyEntries: 100,
    createdAt: '2024-04-09T08:11:28.356Z',
    updatedAt: '2024-04-09T08:11:28.356Z',
  },
  {
    id: '2f58baca-3d6f-4e06-b0f0-58eca6d1a563',
    name: 'Enterprise',
    discountType: 'FIXED',
    originalPrice: 499.99,
    discountAmount: 100,
    isRecommended: false,
    isActive: false,
    position: 2,
    tierType: 'MONTHLY',
    summary: 'Enterprise tier with full feature set',
    benefits: [
      'Everything in Professional',
      'Custom integration',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label solution',
    ],
    monthlyEntries: 500,
    createdAt: '2024-04-09T08:11:28.356Z',
    updatedAt: '2024-04-09T08:11:28.356Z',
  },
];

// Packages
export const packagesList = [
  {
    id: 1,
    name: 'Monthly Basic',
    tier: 'Basic',
    duration: 1,
    price: 19.99,
    discount: 0,
    active: true,
  },
  {
    id: 2,
    name: 'Yearly Basic',
    tier: 'Basic',
    duration: 12,
    price: 199.99,
    discount: 16.6,
    active: true,
  },
  {
    id: 3,
    name: 'Monthly Premium',
    tier: 'Premium',
    duration: 1,
    price: 49.99,
    discount: 0,
    active: true,
  },
  {
    id: 4,
    name: 'Yearly Premium',
    tier: 'Premium',
    duration: 12,
    price: 499.99,
    discount: 16.6,
    active: true,
  },
];

// Members
export const membersList = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    package: 'Monthly Premium',
    joinDate: '2023-01-15',
    subscribed: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    package: 'Yearly Basic',
    joinDate: '2023-02-20',
    subscribed: true,
  },
  {
    id: 3,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    status: 'blocked',
    package: 'Yearly Premium',
    joinDate: '2022-11-05',
    subscribed: true,
  },
  {
    id: 4,
    name: 'Bob Brown',
    email: 'bob.brown@example.com',
    status: 'inactive',
    package: 'Monthly Basic',
    joinDate: '2023-03-10',
    subscribed: false,
  },
];

// Partners
export const partnersList = [
  {
    id: 1,
    name: 'Acme Corp',
    contactPerson: 'Michael Scott',
    email: 'michael@acme.com',
    promoCode: 'ACME20',
    discount: 20,
    active: true,
  },
  {
    id: 2,
    name: 'Wayne Enterprises',
    contactPerson: 'Bruce Wayne',
    email: 'bruce@wayne.com',
    promoCode: 'WAYNE15',
    discount: 15,
    active: true,
  },
  {
    id: 3,
    name: 'Stark Industries',
    contactPerson: 'Tony Stark',
    email: 'tony@stark.com',
    promoCode: 'STARK25',
    discount: 25,
    active: false,
  },
];

// Events
export const eventsList = [
  {
    id: 1,
    name: 'Summer Fest 2023',
    date: '2023-07-15',
    status: 'upcoming',
    participants: 0,
    winners: [],
    content: 'Join us for the biggest summer event of the year!',
  },
  {
    id: 2,
    name: 'Tech Conference',
    date: '2023-05-10',
    status: 'completed',
    participants: 800,
    winners: [
      { place: 1, memberId: 1, name: 'John Doe', prize: 'MacBook Pro' },
      { place: 2, memberId: 2, name: 'Jane Smith', prize: 'iPad Air' },
      { place: 3, memberId: 3, name: 'Alice Johnson', prize: 'AirPods Pro' },
    ],
    content: 'Learn about the latest technologies and network with industry experts.',
  },
  {
    id: 3,
    name: 'Fitness Challenge',
    date: '2023-08-20',
    status: 'upcoming',
    participants: 200,
    winners: [],
    content: 'Push your limits and compete for amazing prizes!',
  },
];

// Content
export const contentList = [
  {
    id: 1,
    title: 'Welcome Email',
    type: 'email',
    content: 'Welcome to our platform! We are excited to have you join us...',
    lastModified: '2023-03-15',
  },
  {
    id: 2,
    title: 'Event Announcement',
    type: 'notification',
    content: 'We are thrilled to announce our upcoming Summer Fest 2023...',
    lastModified: '2023-04-10',
  },
  {
    id: 3,
    title: 'Terms and Conditions',
    type: 'legal',
    content: 'Please read these terms and conditions carefully before using our service...',
    lastModified: '2023-01-25',
  },
];
