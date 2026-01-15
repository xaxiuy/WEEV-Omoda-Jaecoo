// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Brand types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  industry: string | null;
  description: string | null;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Activation types
export interface Activation {
  id: string;
  userId: string;
  brandId: string;
  vin: string | null;
  licensePlate: string | null;
  model: string | null;
  year: number | null;
  verificationMethod: string;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Wallet types
export interface WalletCard {
  id: string;
  userId: string;
  brandId: string;
  memberId: string;
  tier: string;
  activationId: string | null;
  brand?: Brand;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface AnalyticsEvent {
  eventType: string;
  eventData?: any;
  sessionId?: string;
}

// Post types
export interface Post {
  id: string;
  brandId: string;
  authorId: string | null;
  type: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  isPinned: boolean;
  published: boolean;
  likesCount: number;
  commentsCount: number;
  userLiked?: boolean;
  authorName?: string;
  brandName?: string;
  brandLogoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Event types
export interface Event {
  id: string;
  brandId: string;
  type: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  city: string | null;
  locationText: string | null;
  startAt: string;
  endAt: string;
  capacity: number | null;
  rsvpCount: number;
  published: boolean;
  userRsvpStatus?: string | null;
  brandName?: string;
  brandLogoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletUpdate {
  id: string;
  userId: string;
  brandId: string;
  type: string;
  title: string;
  description: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}
