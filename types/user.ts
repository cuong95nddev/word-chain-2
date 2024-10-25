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
  user_id: string;
  username: string;
  display_name: string;
  total_games: number;
  total_wins: number;
  total_score: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total_games: number;
  total_wins: number;
  total_score: number;
  win_rate: number;
  average_score: number;
}
