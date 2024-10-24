export interface Player {
  id: string;
  name: string;
  score: number;
  is_active: boolean;
  avatar_url?: string;
  last_played_at?: number;
  recent_words?: string[];
}

export interface Word {
  text: string;
  player_id: string;
  timestamp: number;
  is_valid: boolean;
  score?: number;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameSettings {
  max_players: number;
  time_limit: number;
  min_word_length: number;
  max_word_length?: number;
  language: 'vi' | 'en';
  allow_repeat_words: boolean;
  points_per_letter: number;
  bonus_points: {
    long_word: number;
    quick_answer: number;
    streak: number;
  };
}

export interface Game {
  id: string;
  created_at: string;
  players: Player[];
  words: Word[];
  current_player_id: string;
  status: GameStatus;
  time_limit: number;
  min_word_length: number;
  settings: GameSettings;
  last_word_at: number;
  host_id: string;
  winner_id?: string;
}

export interface ChatMessage {
  id: string;
  gameId: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalGames: number;
  wins: number;
  totalScore: number;
  averageScore: number;
  winRate: number;
  lastPlayed: string;
}
