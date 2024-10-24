export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  totalGames: number;
  totalWins: number;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalGames: number;
  totalWins: number;
  totalScore: number;
  winRate: number;
  averageScore: number;
}
