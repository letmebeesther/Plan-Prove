export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
  trustScore: number;
}

export interface SubGoal {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  dueDate: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  startDate: string;
  endDate: string;
  subGoals: SubGoal[];
  author: User;
  imageUrl?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participantCount: number;
  growthRate: number;
  imageUrl: string;
  category: string;
}

export enum Category {
  Health = '건강관리',
  Language = '어학',
  Study = '공부루틴',
  Career = '커리어스킬',
  Hobby = '취미',
  Asset = '재정관리'
}