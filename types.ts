
export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
  trustScore: number;
  statusMessage?: string; // FR-238
  email?: string; // Account ID
  followers?: number;
  following?: number;
  totalPlans?: number; // FR-240
  completedGoals?: number; // FR-240
  hasWearable?: boolean; // New: Tracks if user connected a device
  isAdmin?: boolean; // FR-DEV
}

export interface Evidence {
  id: string;
  type: 'PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE' | 'BIOMETRIC' | 'EMAIL' | 'API'; // Added EMAIL, API
  url?: string; // For photo/video (Primary URL)
  imageUrls?: string[]; // For multiple photos
  content?: string; // For text/description
  fileHash?: string; // SHA-256 Hash (Primary)
  fileHashes?: string[]; // Hashes for multiple files
  status: 'APPROVED' | 'WARNING' | 'PENDING' | 'REJECTED'; // FR-053 (AI Status)
  createdAt: string;
  feedback?: string; // AI Feedback
  
  // Specific fields for new types
  verifiedEmail?: string; // For EMAIL type
  apiProvider?: string; // For API type (e.g. "Q-Net", "ETS")
  apiReferenceId?: string; // For API type (e.g. License #)
}

export interface EvidenceOption {
  type: 'PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE' | 'BIOMETRIC' | 'EMAIL' | 'API'; // Added EMAIL, API
  description: string; // e.g. "Take a photo of your running shoes"
  timeMetadata?: string; // e.g. "07:00 AM"
  biometricData?: string; // e.g. "Heart rate > 120"
  locationMetadata?: string; // e.g. "Gym", "Library"
}

export interface SubGoal {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  dueDate: string;
  dueTime?: string;
  
  // New fields for FR-031, FR-032, FR-033
  startDate?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  
  // Selected Evidence Settings
  evidenceTypes?: ('PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE' | 'BIOMETRIC' | 'EMAIL' | 'API')[]; // Changed to Array
  evidenceDescription?: string; // The specific verification instruction selected by user
  
  // AI Generated Options to choose from
  evidenceOptions?: EvidenceOption[];

  // Legacy/Fallback Metadata fields
  exampleTimeMetadata?: string; 
  exampleBiometricData?: string; 
  exampleLocationMetadata?: string; // New: Target location for verification

  evidences?: Evidence[]; // FR-047
  failureReason?: string; // FR-054
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  startDate: string;
  endDate: string;
  executionTime?: string; // New: Preferred daily time for the plan
  subGoals: SubGoal[];
  author: User;
  authorId?: string; // Added for explicit linking
  imageUrl?: string;
  tags?: string[]; // FR-038
  createdAt?: string; // FR-039
  updatedAt?: string; // FR-039
  
  // Additional fields for My Page
  growthRate?: number; // FR-247
  lastCertifiedAt?: string; // FR-248
  daysLeft?: number; // FR-249
  
  // Past Plan fields
  finalAchievementRate?: number; // FR-252
  isSuccess?: boolean; // FR-253
  failureReason?: string; // FR-254
  hasRetrospective?: boolean; // FR-255
  retrospectiveContent?: string; // FR-056
  
  isPublic?: boolean;
  likes?: number; // Added for popularity sorting
}

export interface PlanAnalysis {
  planId: string;
  dailyRecords: { date: string; status: 'SUCCESS' | 'FAIL' | 'NONE' }[]; // FR-257
  subGoalStats: { title: string; status: 'SUCCESS' | 'FAIL' }[]; // FR-258
  failureAnalysis: { reason: string; count: number }[]; // FR-259
  certificationFrequency: number[]; // FR-260 (Mock data for graph)
}

export interface TrustScoreHistory {
  id: string;
  date: string;
  type: 'EVALUATION' | 'CERTIFICATION' | 'FAILURE' | 'COMMUNITY';
  change: number; // + or - value
  reason: string;
  balance: number;
}

export interface ScrapItem {
  id: string;
  userId?: string;
  type: 'PLAN' | 'SUBGOAL' | 'POST';
  title: string;
  content: string;
  originalId: string;
  savedAt: string;
  category?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  isImportant: boolean;
}

export interface Certification {
  id: string;
  user: User;
  imageUrl?: string;
  description: string;
  relatedGoalTitle: string;
  planId?: string; // Added to link feed to plan
  challengeId?: string; // Optional link to challenge
  createdAt: string;
  likes: number;
  comments: number;
  reactions: Record<string, number>;
  isLiked?: boolean;
}

export interface ChatRoom {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string; // For group chats
  participants: User[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  statusMessage: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  
  // Host Info
  host: User;
  coHosts: User[];
  
  // Stats
  participantCount: number;
  participantIds?: string[]; // For filtering "My Challenges"
  growthRate: number; // 그룹 성장률
  avgAchievement: number; // 평균 달성률
  retentionRate: number; // 유지율
  avgTrustScore: number; // 신뢰도 평균
  stabilityIndex: number; // 안정성 지수
  
  // Detailed Stats Trends (Mock)
  growthTrend?: number[];
  
  notices?: Notice[];
  
  // My Page Context
  myAchievementRate?: number; // FR-283
  myLastCertifiedAt?: string; // FR-284
}

export interface Participant {
  user: User;
  role: 'HOST' | 'CO_HOST' | 'MEMBER';
  achievementRate: number;
  growthRate: number;
  connectedGoalId?: string;
  connectedGoalTitle?: string;
  joinedAt: string;
  lastCertifiedAt?: string;
  trustScore: number;
}

export interface ChatMessage {
  id: string;
  user: User;
  content: string;
  type: 'TEXT' | 'IMAGE';
  createdAt: string;
  reactions: Record<string, number>;
}

export interface MonthlyChallenge {
  id: string;
  title: string;
  imageUrl: string;
  description: string; // Welcome message
  participants: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ENDED';
  tags: string[];
  
  // My Page Context
  myPostCount?: number; // FR-288
  isPopularAuthor?: boolean; // FR-289
}

export type MissionType = 'ACTION' | 'REFLECTION' | 'CREATIVE' | 'SOCIAL';
export type MissionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface RandomMission {
  id: string;
  content: string;
  date: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  participants: number;
  isCompleted?: boolean;
  
  // Interaction Data
  completedAt?: string;
  certificationType?: 'PHOTO' | 'TEXT' | 'CHECK';
  certificationContent?: string;
  feedback?: {
    liked: boolean; // 👍 / 👎
    difficultyRating?: 'TOO_EASY' | 'GOOD' | 'TOO_HARD';
  };
}

export interface ForumPost {
  id: string;
  author: User;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  isPopular: boolean;
  createdAt: string;
  isScrapped?: boolean;
  replies?: ForumPost[]; // For nested answers
}

export enum Category {
  Health = '건강관리',
  Language = '어학',
  Study = '공부루틴',
  Career = '커리어스킬',
  Hobby = '취미',
  Asset = '재정관리',
  Life = '생활루틴',
  Reading = '독서',
  Cert = '자격증',
  Exercise = '운동'
}
