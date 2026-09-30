export type Role = 'USER' | 'ADMIN';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'FUNDED'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type RefundStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    campaigns?: number;
    contributions?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    campaigns?: number;
  };
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  creatorId: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  fundingGoal: number;
  amountRaised: number;
  deadline: string;
  status: CampaignStatus;
  coverImage?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  creator?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
    bio?: string | null;
  };
  updates?: CampaignUpdate[];
  contributions?: Contribution[];
  fundingPercentage: number;
  supporterCount: number;
  isExpired: boolean;
  daysRemaining: number;
  _count?: {
    contributions: number;
  };
}

export interface Contribution {
  id: string;
  campaignId: string;
  contributorId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionReference: string;
  createdAt: string;
  updatedAt: string;
  campaign?: Campaign;
  contributor?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
  };
  refund?: Refund | null;
}

export interface Refund {
  id: string;
  contributionId: string;
  amount: number;
  status: RefundStatus;
  refundReference: string;
  processedAt: string;
  contribution?: Contribution;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface LandingMetrics {
  hasData: boolean;
  totalCampaigns: number;
  successfulCampaigns: number;
  totalFundsRaised: number;
  totalSupporters: number;
}

export interface UserDashboardStats {
  totalContributed: number;
  totalContributionsCount: number;
  activeContributionsCount: number;
  campaignsCreatedCount: number;
  successfulCampaignsCount: number;
  recentContributions: Contribution[];
  myCampaigns: Campaign[];
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  successfulCampaigns: number;
  failedCampaigns: number;
  pendingCampaigns: number;
  totalContributions: number;
  totalFundsRaised: number;
  averageContribution: number;
  totalRefunds: number;
  totalRefundAmount: number;
}

export interface ReportOverviewData {
  hasData: boolean;
  overview: AdminStats;
  categoryDistribution: Array<{
    categoryId: string;
    name: string;
    slug: string;
    campaignCount: number;
    totalRaised: number;
  }>;
  contributionTrends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  campaignTrends: Array<{
    date: string;
    created: number;
  }>;
}

export interface RecommendationResponse {
  hasActivity: boolean;
  message: string;
  recommendations: Campaign[];
}

export interface InnovationAnalysis {
  overallScore: number;
  feasibilityScore: number;
  impactScore: number;
  marketViabilityScore: number;
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'ELEVATED_RISK';
  verdict: string;
  strengths: string[];
  recommendations: string[];
  badges: string[];
  milestones: Array<{ phase: string; title: string; capitalShare: string }>;
}
