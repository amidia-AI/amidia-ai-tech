export interface Content {
  id: string;
  type: 'challenge' | 'guide';
  title: string;
  description: string;
  createdAt: any; // Firestore Timestamp
  coverTag: string;
  checklist?: ChecklistItem[];
  resources?: string[];
}

export interface ChecklistItem {
  step: string;
  done: boolean;
}

export interface MetricStat {
  value: string;
  label: string;
  subtext?: string;
}

export interface KitSubmission {
  id: string;
  name: string;
  company: string;
  email: string;
  promotionGoal: string;
  createdAt: any;
  status: 'pending' | 'token_generated' | 'rejected';
  token?: string;
  expiresAt?: string;
  link?: string;
}

export interface KitToken {
  token: string;
  submissionId?: string;
  brandName: string;
  company: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  revokedAt?: string;
  dedicatedPrice?: number | string;
  integratedPrice?: number | string;
  commercialUsagePrice?: number | string;
}

export interface StudioScreenshot {
  id: string;
  monthYear: string;
  label: string;
  imageUrl: string;
  dateRange?: string;
  category?: 'demographics' | 'devices' | 'geography' | 'reach' | 'retention' | 'general';
  createdAt: any;
}

export interface KitViewLog {
  id: string;
  token: string;
  brandName: string;
  company?: string;
  openedAt: any;
  userAgent?: string;
  ip?: string;
}

export interface VideoIdea {
  id: string;
  title: string;
  description: string;
  isBooked?: boolean;
  createdAt?: string;
}

export interface PricingPreset {
  id: string;
  name: string;
  description?: string;
  dedicatedPrice: number;
  integratedPrice: number;
  commercialUsagePrice: number;
  expiryDays: string;
  isCustom?: boolean;
}

export interface LiveChannelStats {
  subscriberCount: number | string;
  totalViews: number | string;
  viewsLast30Days: string;
  uploadFrequency: string;
  lastUpdated?: string;
}

export interface PastSponsorCampaign {
  id: string;
  videoThumbnail: string;
  brandName: string;
  whatTheyWanted: string;
  whatIMade: string;
  headlineResult: string;
  youtubeVideoId?: string;
  publishedDate?: string;
}

export interface CaseStudy {
  id: string;
  indexNumber: string;
  clientName: string;
  clientLogoType: string;
  clientIndustry: string;
  category: string;
  title: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  videoStatus: string;
  videoStatusBadge: string;
  tags: string[];
  fullStory: {
    overview: string;
    challenge: string;
    solution: string;
    architecturePoints: string[];
    results: string[];
    techStack?: string[];
    timeline?: string;
    productionNote?: string;
  };
}


