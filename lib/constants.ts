import { GameSettings } from '@/types';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  max_players: 4,
  time_limit: 30,
  min_word_length: 2,
  max_word_length: 10,
  language: 'vi',
  allow_repeat_words: false,
  points_per_letter: 10,
  bonus_points: {
    long_word: 20,
    quick_answer: 15,
    streak: 25,
  },
};

export const GAME_EVENTS = {
  PLAYER_JOINED: 'PLAYER_JOINED',
  PLAYER_LEFT: 'PLAYER_LEFT',
  WORD_PLAYED: 'WORD_PLAYED',
  GAME_STARTED: 'GAME_STARTED',
  GAME_ENDED: 'GAME_ENDED',
  TURN_TIMEOUT: 'TURN_TIMEOUT',
};

export const ERROR_MESSAGES = {
  WORD_TOO_SHORT: 'Từ quá ngắn',
  WORD_TOO_LONG: 'Từ quá dài',
  WORD_USED: 'Từ đã được sử dụng',
  INVALID_START: 'Từ không bắt đầu đúng',
  INVALID_WORD: 'Từ không hợp lệ',
  NOT_YOUR_TURN: 'Chưa đến lượt của bạn',
  GAME_FULL: 'Phòng đã đầy',
  GAME_STARTED: 'Trò chơi đã bắt đầu',
};
